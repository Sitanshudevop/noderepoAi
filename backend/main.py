"""
FastAPI Backend for RepoGraph AI
Integrates repository parsing with IBM Bob AI intelligence
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from pathlib import Path

from parser import parse_repository
from ai_service import ai_service

app = FastAPI(title="RepoGraph AI API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for parsed repositories
repo_cache: Dict[str, Dict[str, Any]] = {}


class ScanRequest(BaseModel):
    repo_path: str


class ModernizeRequest(BaseModel):
    node: Optional[str] = None
    target_language: Optional[str] = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "RepoGraph AI API",
        "version": "1.0.0",
        "ai_provider": "IBM Bob"
    }


@app.post("/api/repo/scan")
async def scan_repository(request: ScanRequest):
    """
    Scan a repository and generate dependency graph
    """
    repo_path = request.repo_path
    
    # Validate path
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail=f"Repository path not found: {repo_path}")
    
    if not os.path.isdir(repo_path):
        raise HTTPException(status_code=400, detail=f"Path is not a directory: {repo_path}")
    
    try:
        # Parse repository
        graph_data = parse_repository(repo_path)
        
        # Cache the result
        repo_cache[repo_path] = graph_data
        
        return {
            "status": "success",
            "repo_path": repo_path,
            "summary": graph_data.get("metadata", {})
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing repository: {str(e)}")


@app.get("/api/repo/graph")
async def get_graph(repo_path: Optional[str] = None):
    """
    Get the full graph data for a repository
    """
    if not repo_path:
        if repo_cache:
            repo_path = list(repo_cache.keys())[0]
        else:
            raise HTTPException(status_code=400, detail="No repository has been scanned yet")
    
    if repo_path not in repo_cache:
        raise HTTPException(status_code=404, detail=f"Repository not found in cache: {repo_path}")
    
    return repo_cache[repo_path]


@app.get("/api/node/{node_id:path}")
async def get_node(node_id: str, repo_path: Optional[str] = None):
    """
    Get detailed information about a specific node
    """
    if not repo_path:
        if repo_cache:
            repo_path = list(repo_cache.keys())[0]
        else:
            raise HTTPException(status_code=400, detail="No repository has been scanned yet")
    
    if repo_path not in repo_cache:
        raise HTTPException(status_code=404, detail=f"Repository not found in cache: {repo_path}")
    
    graph_data = repo_cache[repo_path]
    
    # Find the node
    node = None
    for n in graph_data["nodes"]:
        if n["id"] == node_id:
            node = n
            break
    
    if not node:
        raise HTTPException(status_code=404, detail=f"Node not found: {node_id}")
    
    # Find related edges
    incoming_edges = [e for e in graph_data["edges"] if e["target"] == node_id]
    outgoing_edges = [e for e in graph_data["edges"] if e["source"] == node_id]
    
    return {
        "node": node,
        "incoming_edges": incoming_edges,
        "outgoing_edges": outgoing_edges,
        "dependency_count": {
            "incoming": len(incoming_edges),
            "outgoing": len(outgoing_edges)
        }
    }


@app.get("/api/dashboard/summary")
async def get_dashboard_summary(repo_path: Optional[str] = None):
    """
    Get summary statistics for the dashboard
    """
    if not repo_path:
        if repo_cache:
            repo_path = list(repo_cache.keys())[0]
        else:
            raise HTTPException(status_code=400, detail="No repository has been scanned yet")
    
    if repo_path not in repo_cache:
        raise HTTPException(status_code=404, detail=f"Repository not found in cache: {repo_path}")
    
    graph_data = repo_cache[repo_path]
    metadata = graph_data.get("metadata", {})
    
    # Find hotspots (high risk or high coupling)
    hotspots = []
    for node in graph_data["nodes"]:
        if node.get("risk_score", 0) > 0.6 or "high_coupling" in node.get("tags", []):
            hotspots.append({
                "id": node["id"],
                "name": node["name"],
                "type": node["type"],
                "risk_score": node.get("risk_score", 0),
                "tech_debt_score": node.get("tech_debt_score", 0)
            })
    
    # Sort hotspots by risk score
    hotspots.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "metadata": metadata,
        "hotspots": hotspots[:10],
        "repo_path": repo_path
    }


@app.post("/api/node/{node_id:path}/explain")
async def explain_node(node_id: str, repo_path: Optional[str] = None):
    """
    Generate IBM Bob-powered explanation for a node
    """
    node_data = await get_node(node_id, repo_path)
    node = node_data["node"]
    
    # Use IBM Bob AI service
    response = await ai_service.explain_node(node)
    
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error or "Failed to generate explanation")
    
    return {
        **response.data,
        "confidence": response.confidence,
        "ai_provider": "IBM Bob"
    }


@app.post("/api/node/{node_id:path}/analyze")
async def analyze_node(node_id: str, repo_path: Optional[str] = None):
    """
    Analyze technical debt and risks using IBM Bob
    """
    node_data = await get_node(node_id, repo_path)
    node = node_data["node"]
    
    # Use IBM Bob AI service
    response = await ai_service.analyze_node(node)
    
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error or "Failed to analyze node")
    
    return {
        **response.data,
        "confidence": response.confidence,
        "ai_provider": "IBM Bob"
    }


@app.post("/api/node/{node_id:path}/modernize")
async def modernize_node(node_id: str, body: ModernizeRequest = ModernizeRequest(), repo_path: Optional[str] = None):
    """
    Generate modernized code using IBM Bob.
    Accepts optional target_language in the request body.
    """
    node_data = await get_node(node_id, repo_path)
    node = node_data["node"]
    
    # Use IBM Bob AI service with optional target language override
    response = await ai_service.modernize_node(node, target_language=body.target_language)
    
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error or "Failed to modernize code")
    
    return {
        **response.data,
        "confidence": response.confidence,
        "ai_provider": "IBM Bob",
        "target_language": body.target_language or "auto"
    }


@app.post("/api/node/{node_id:path}/tests")
async def generate_tests(node_id: str, repo_path: Optional[str] = None):
    """
    Generate unit tests using IBM Bob
    """
    node_data = await get_node(node_id, repo_path)
    node = node_data["node"]
    
    # Use IBM Bob AI service
    response = await ai_service.generate_tests_for_node(node)
    
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error or "Failed to generate tests")
    
    return {
        **response.data,
        "confidence": response.confidence,
        "ai_provider": "IBM Bob"
    }


@app.post("/api/node/{node_id:path}/docs")
async def generate_documentation(node_id: str, repo_path: Optional[str] = None):
    """
    Generate documentation using IBM Bob
    """
    node_data = await get_node(node_id, repo_path)
    node = node_data["node"]
    
    # Use IBM Bob AI service
    response = await ai_service.generate_docs_for_node(node)
    
    if not response.success:
        raise HTTPException(status_code=500, detail=response.error or "Failed to generate documentation")
    
    return {
        **response.data,
        "confidence": response.confidence,
        "ai_provider": "IBM Bob"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
