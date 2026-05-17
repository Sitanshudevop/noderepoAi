"""
Repository Parser - Extracts dependency graph from Python codebases
"""
import ast
import os
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
import json
from dataclasses import dataclass, asdict


@dataclass
class Node:
    """Represents a code entity in the dependency graph"""
    id: str
    name: str
    label: str
    type: str  # file, module, class, function
    language: str
    file_path: str
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    code_snippet: Optional[str] = None
    dependencies: List[str] = None
    risk_score: float = 0.0
    tech_debt_score: float = 0.0
    modernization_priority: str = "low"
    tags: List[str] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.tags is None:
            self.tags = []


@dataclass
class Edge:
    """Represents a dependency relationship"""
    source: str
    target: str
    relationship_type: str  # import, call, inheritance
    strength: float = 1.0


class PythonASTParser:
    """Parse Python files using AST to extract code structure and dependencies"""
    
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []
        self.file_imports: Dict[str, Set[str]] = {}
        
        # Directories to exclude
        self.exclude_dirs = {
            '.git', '.venv', 'venv', 'env', '__pycache__', 
            'node_modules', 'dist', 'build', '.pytest_cache',
            '.mypy_cache', '.tox', 'htmlcov', '.coverage'
        }
    
    def should_exclude(self, path: Path) -> bool:
        """Check if path should be excluded from parsing"""
        parts = path.parts
        return any(excluded in parts for excluded in self.exclude_dirs)
    
    def parse_repository(self) -> Dict:
        """Main entry point - parse entire repository"""
        print(f"Parsing repository: {self.repo_path}")
        
        # Find all Python files
        python_files = []
        for py_file in self.repo_path.rglob("*.py"):
            if not self.should_exclude(py_file):
                python_files.append(py_file)
        
        print(f"Found {len(python_files)} Python files")
        
        # Parse each file
        for py_file in python_files:
            self._parse_file(py_file)
        
        # Build edges from imports and calls
        self._build_edges()
        
        # Calculate risk scores
        self._calculate_scores()
        
        # Return graph data
        return self._to_graph_json()
    
    def _parse_file(self, file_path: Path):
        """Parse a single Python file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content, filename=str(file_path))
            
            # Create file node
            rel_path = file_path.relative_to(self.repo_path)
            file_id = f"file:{rel_path}"
            
            file_node = Node(
                id=file_id,
                name=file_path.name,
                label=str(rel_path),
                type="file",
                language="python",
                file_path=str(rel_path),
                line_start=1,
                line_end=len(content.splitlines()),
                tags=["python"]
            )
            self.nodes[file_id] = file_node
            
            # Track imports for this file
            imports = set()
            
            # Parse top-level definitions
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.add(alias.name)
                
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.add(node.module)
                
                elif isinstance(node, ast.ClassDef):
                    self._parse_class(node, file_path, rel_path, file_id)
                
                elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                    # Only top-level functions
                    if self._is_top_level(node, tree):
                        self._parse_function(node, file_path, rel_path, file_id)
            
            self.file_imports[file_id] = imports
            
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
    
    def _is_top_level(self, node: ast.AST, tree: ast.Module) -> bool:
        """Check if a node is at the top level of the module"""
        return node in tree.body
    
    def _parse_class(self, node: ast.ClassDef, file_path: Path, rel_path: Path, file_id: str):
        """Parse a class definition"""
        class_id = f"class:{rel_path}:{node.name}"
        
        # Get base classes
        bases = [self._get_name(base) for base in node.bases]
        
        # Get code snippet
        snippet = self._get_code_snippet(file_path, node.lineno, min(node.lineno + 5, node.end_lineno or node.lineno))
        
        class_node = Node(
            id=class_id,
            name=node.name,
            label=f"{rel_path.stem}.{node.name}",
            type="class",
            language="python",
            file_path=str(rel_path),
            line_start=node.lineno,
            line_end=node.end_lineno,
            code_snippet=snippet,
            tags=["class"] + (["has_inheritance"] if bases else [])
        )
        self.nodes[class_id] = class_node
        
        # Create edge from file to class
        self.edges.append(Edge(
            source=file_id,
            target=class_id,
            relationship_type="contains"
        ))
        
        # Parse methods
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                self._parse_method(item, file_path, rel_path, class_id, node.name)
    
    def _parse_function(self, node: ast.FunctionDef, file_path: Path, rel_path: Path, parent_id: str):
        """Parse a top-level function"""
        func_id = f"function:{rel_path}:{node.name}"
        
        # Get code snippet
        snippet = self._get_code_snippet(file_path, node.lineno, min(node.lineno + 5, node.end_lineno or node.lineno))
        
        # Count complexity indicators
        complexity = self._calculate_complexity(node)
        
        func_node = Node(
            id=func_id,
            name=node.name,
            label=f"{rel_path.stem}.{node.name}()",
            type="function",
            language="python",
            file_path=str(rel_path),
            line_start=node.lineno,
            line_end=node.end_lineno,
            code_snippet=snippet,
            tags=["function"] + (["complex"] if complexity > 10 else [])
        )
        self.nodes[func_id] = func_node
        
        # Create edge from parent to function
        self.edges.append(Edge(
            source=parent_id,
            target=func_id,
            relationship_type="contains"
        ))
    
    def _parse_method(self, node: ast.FunctionDef, file_path: Path, rel_path: Path, class_id: str, class_name: str):
        """Parse a class method"""
        method_id = f"method:{rel_path}:{class_name}.{node.name}"
        
        # Get code snippet
        snippet = self._get_code_snippet(file_path, node.lineno, min(node.lineno + 5, node.end_lineno or node.lineno))
        
        # Count complexity
        complexity = self._calculate_complexity(node)
        
        method_node = Node(
            id=method_id,
            name=node.name,
            label=f"{class_name}.{node.name}()",
            type="method",
            language="python",
            file_path=str(rel_path),
            line_start=node.lineno,
            line_end=node.end_lineno,
            code_snippet=snippet,
            tags=["method"] + (["complex"] if complexity > 10 else [])
        )
        self.nodes[method_id] = method_node
        
        # Create edge from class to method
        self.edges.append(Edge(
            source=class_id,
            target=method_id,
            relationship_type="contains"
        ))
    
    def _get_name(self, node: ast.AST) -> str:
        """Extract name from AST node"""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_name(node.value)}.{node.attr}"
        return ""
    
    def _get_code_snippet(self, file_path: Path, start_line: int, end_line: int) -> str:
        """Extract code snippet from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                snippet_lines = lines[start_line-1:end_line]
                return ''.join(snippet_lines).strip()
        except:
            return ""
    
    def _calculate_complexity(self, node: ast.FunctionDef) -> int:
        """Calculate cyclomatic complexity"""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity
    
    def _build_edges(self):
        """Build import edges between files"""
        for file_id, imports in self.file_imports.items():
            for imp in imports:
                # Try to find matching file
                for target_id in self.nodes.keys():
                    if target_id.startswith("file:") and imp in target_id:
                        self.edges.append(Edge(
                            source=file_id,
                            target=target_id,
                            relationship_type="imports"
                        ))
    
    def _calculate_scores(self):
        """Calculate risk and technical debt scores"""
        for node_id, node in self.nodes.items():
            # File-level scoring
            if node.type == "file":
                lines = node.line_end - node.line_start + 1 if node.line_end else 0
                
                # Large files are risky
                if lines > 500:
                    node.risk_score += 0.3
                    node.tech_debt_score += 0.2
                    node.tags.append("large_file")
                
                if lines > 1000:
                    node.risk_score += 0.3
                    node.tech_debt_score += 0.3
            
            # Function/method complexity
            if node.type in ["function", "method"]:
                if "complex" in node.tags:
                    node.risk_score += 0.4
                    node.tech_debt_score += 0.3
                
                lines = node.line_end - node.line_start + 1 if node.line_end else 0
                if lines > 50:
                    node.risk_score += 0.2
                    node.tech_debt_score += 0.2
                    node.tags.append("long_function")
            
            # Dependency count
            dep_count = len([e for e in self.edges if e.source == node_id])
            if dep_count > 10:
                node.risk_score += 0.2
                node.tags.append("high_coupling")
            
            # Normalize scores
            node.risk_score = min(1.0, node.risk_score)
            node.tech_debt_score = min(1.0, node.tech_debt_score)
            
            # Set modernization priority
            if node.risk_score > 0.6 or node.tech_debt_score > 0.6:
                node.modernization_priority = "high"
            elif node.risk_score > 0.3 or node.tech_debt_score > 0.3:
                node.modernization_priority = "medium"
            else:
                node.modernization_priority = "low"
    
    def _to_graph_json(self) -> Dict:
        """Convert parsed data to graph JSON format"""
        return {
            "nodes": [asdict(node) for node in self.nodes.values()],
            "edges": [asdict(edge) for edge in self.edges],
            "metadata": {
                "total_files": len([n for n in self.nodes.values() if n.type == "file"]),
                "total_classes": len([n for n in self.nodes.values() if n.type == "class"]),
                "total_functions": len([n for n in self.nodes.values() if n.type in ["function", "method"]]),
                "total_edges": len(self.edges),
                "high_risk_nodes": len([n for n in self.nodes.values() if n.risk_score > 0.6]),
                "modernization_candidates": len([n for n in self.nodes.values() if n.modernization_priority == "high"])
            }
        }


def parse_repository(repo_path: str) -> Dict:
    """Main function to parse a repository"""
    parser = PythonASTParser(repo_path)
    return parser.parse_repository()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        repo_path = sys.argv[1]
        result = parse_repository(repo_path)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python parser.py <repo_path>")
