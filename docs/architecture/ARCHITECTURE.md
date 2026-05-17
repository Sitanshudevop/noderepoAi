# RepoGraph AI - System Architecture

## Executive Summary

RepoGraph AI is a visual legacy modernization copilot that combines dependency graph analysis with IBM Bob's AI intelligence to accelerate codebase understanding and safe refactoring. The system parses source code repositories, generates interactive dependency graphs, and provides context-aware modernization recommendations powered by IBM Bob.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│                    (React + TypeScript + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Graph      │  │    Node      │  │  Dashboard   │          │
│  │   Canvas     │  │   Sidebar    │  │   Summary    │          │
│  │ (Cytoscape)  │  │   Details    │  │   Metrics    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Modernization│  │     Diff     │  │    Test      │          │
│  │    Panel     │  │    Viewer    │  │   Viewer     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                          REST API (JSON)
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                         Backend Layer                            │
│                      (FastAPI + Python 3.11+)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │  /api/repo/scan  |  /api/repo/graph  |  /api/node/*     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Parsing    │  │    Graph     │  │   IBM Bob    │          │
│  │   Engine     │  │   Analysis   │  │  AI Service  │          │
│  │  (AST-based) │  │  (NetworkX)  │  │  (Provider)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ IBM Bob API
                                ▼
                    ┌───────────────────────┐
                    │      IBM Bob AI       │
                    │  Intelligence Layer   │
                    └───────────────────────┘
```

## Component Architecture

### 1. Frontend Layer

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Cytoscape.js for graph visualization
- Axios for API communication

**Key Components:**

#### Graph Canvas
- **Purpose**: Interactive visualization of code dependencies
- **Features**:
  - Zoom, pan, and drag interactions
  - Node selection and highlighting
  - Dependency path visualization
  - Risk-based color coding
  - Layout algorithms (force-directed, hierarchical)
- **Technology**: Cytoscape.js with dagre layout

#### Node Sidebar
- **Purpose**: Display detailed information for selected nodes
- **Features**:
  - Code snippet preview
  - Metadata display (type, location, metrics)
  - IBM Bob-powered explanations
  - Technical debt analysis
  - Dependency impact visualization
- **State Management**: React hooks (useState, useEffect)

#### Modernization Panel
- **Purpose**: Present code modernization recommendations
- **Features**:
  - Before/after code comparison
  - Diff highlighting
  - Improvement rationale
  - Impact assessment
  - Export functionality

#### Dashboard Summary
- **Purpose**: Repository-level metrics and insights
- **Features**:
  - Total files, classes, functions
  - Risk distribution
  - Hotspot identification
  - Modernization candidates
  - Technical debt overview

### 2. Backend Layer

**Technology Stack:**
- FastAPI (Python 3.11+)
- Python AST for code parsing
- NetworkX for graph analysis
- Pydantic for data validation

**Key Components:**

#### Parsing Engine (`parser.py`)

**Purpose**: Extract code structure and dependencies from repositories

**Architecture**:
```python
PythonASTParser
├── parse_repository()      # Entry point
├── _parse_file()           # File-level parsing
├── _parse_class()          # Class extraction
├── _parse_function()       # Function extraction
├── _parse_method()         # Method extraction
├── _build_edges()          # Dependency mapping
└── _calculate_scores()     # Risk/debt scoring
```

**Capabilities**:
- AST-based Python parsing
- File, class, function, and method extraction
- Import dependency tracking
- Cyclomatic complexity calculation
- Risk and technical debt scoring
- Code snippet extraction
- Metadata enrichment

**Scoring Algorithm**:
```
Risk Score = f(
    file_size,
    cyclomatic_complexity,
    dependency_count,
    code_patterns
)

Technical Debt Score = f(
    function_length,
    nesting_depth,
    missing_documentation,
    code_smells
)

Modernization Priority = f(
    risk_score,
    tech_debt_score,
    business_impact
)
```

#### Graph Analysis Engine

**Purpose**: Analyze code dependency graphs for insights

**Capabilities**:
- Dependency chain analysis
- Circular dependency detection
- Hotspot identification (high fan-in/fan-out)
- Impact radius calculation
- Coupling metrics
- Cohesion analysis

**Graph Model**:
```json
{
  "nodes": [
    {
      "id": "unique_identifier",
      "name": "node_name",
      "type": "file|class|function|method",
      "language": "python",
      "file_path": "relative/path",
      "line_start": 10,
      "line_end": 50,
      "code_snippet": "...",
      "risk_score": 0.75,
      "tech_debt_score": 0.60,
      "modernization_priority": "high",
      "tags": ["complex", "high_coupling"]
    }
  ],
  "edges": [
    {
      "source": "node_id_1",
      "target": "node_id_2",
      "relationship_type": "imports|calls|contains",
      "strength": 1.0
    }
  ]
}
```

#### IBM Bob AI Service (`ai_service.py`)

**Purpose**: Core intelligence layer for code understanding and modernization

**Architecture**:
```python
AIService
├── IBMBobProvider (Primary)
│   ├── explain_code()
│   ├── analyze_technical_debt()
│   ├── modernize_code()
│   ├── generate_tests()
│   └── generate_documentation()
└── AIProvider (Abstract Interface)
```

**IBM Bob Integration Points**:

1. **Code Explanation**
   - Context: File path, dependencies, code structure
   - Output: Summary, purpose, logic flow, complexity assessment
   - Confidence: 85%

2. **Technical Debt Analysis**
   - Context: Risk scores, tags, dependency count
   - Output: Issues, vulnerabilities, recommendations, refactor time
   - Confidence: 90%

3. **Code Modernization**
   - Context: Original code, detected issues, language
   - Output: Modernized code, rationale, improvements, diff stats
   - Confidence: 88%

4. **Test Generation**
   - Context: Code signature, dependencies, complexity
   - Output: Unit tests, edge cases, error handling tests
   - Confidence: 82%

5. **Documentation Generation**
   - Context: Code structure, purpose, dependencies
   - Output: Docstrings, markdown docs, API reference
   - Confidence: 87%

**Provider Abstraction**:
```python
class AIProvider(ABC):
    @abstractmethod
    async def explain_code(self, code: str, context: Dict) -> AIResponse
    
    @abstractmethod
    async def analyze_technical_debt(self, code: str, context: Dict) -> AIResponse
    
    @abstractmethod
    async def modernize_code(self, code: str, context: Dict) -> AIResponse
```

This abstraction allows:
- Easy IBM Bob API integration
- Fallback providers if needed
- Testing with mock providers
- Future provider extensions

### 3. API Layer

**RESTful Endpoints**:

| Endpoint | Method | Purpose | IBM Bob Integration |
|----------|--------|---------|---------------------|
| `/api/repo/scan` | POST | Parse repository | - |
| `/api/repo/graph` | GET | Retrieve graph data | - |
| `/api/node/{id}` | GET | Get node details | - |
| `/api/node/{id}/explain` | POST | Explain code | ✅ Core |
| `/api/node/{id}/analyze` | POST | Analyze debt/risk | ✅ Core |
| `/api/node/{id}/modernize` | POST | Generate modern code | ✅ Core |
| `/api/node/{id}/tests` | POST | Generate tests | ✅ Core |
| `/api/node/{id}/docs` | POST | Generate docs | ✅ Core |
| `/api/dashboard/summary` | GET | Repository metrics | - |

**Response Format**:
```json
{
  "data": { ... },
  "confidence": 0.85,
  "ai_provider": "IBM Bob",
  "success": true
}
```

## Data Flow

### Repository Scanning Flow

```
User uploads repo
      ↓
FastAPI receives path
      ↓
PythonASTParser.parse_repository()
      ↓
For each .py file:
  - Parse AST
  - Extract nodes (files, classes, functions)
  - Track imports
  - Calculate complexity
      ↓
Build dependency edges
      ↓
Calculate risk scores
      ↓
Generate graph JSON
      ↓
Cache in memory
      ↓
Return to frontend
      ↓
Cytoscape renders graph
```

### Node Analysis Flow

```
User clicks node
      ↓
Frontend requests node details
      ↓
Backend retrieves from cache
      ↓
User clicks "Explain"
      ↓
Frontend calls /api/node/{id}/explain
      ↓
AIService.explain_node()
      ↓
IBMBobProvider.explain_code()
  - Build context-aware prompt
  - Analyze code patterns
  - Generate explanation
      ↓
Return AIResponse
      ↓
Display in sidebar
```

### Modernization Flow

```
User clicks "Modernize"
      ↓
Frontend calls /api/node/{id}/modernize
      ↓
AIService.modernize_node()
      ↓
First: analyze_node() for issues
      ↓
IBMBobProvider.modernize_code()
  - Detect code smells
  - Apply modernization patterns
  - Add type hints
  - Add docstrings
  - Improve structure
      ↓
Calculate diff statistics
      ↓
Return modernized code + rationale
      ↓
Display in diff viewer
      ↓
User can export patch
```

## IBM Bob Integration Strategy

### Why IBM Bob is Central

IBM Bob serves as the **primary intelligence layer** for:

1. **Context-Aware Understanding**
   - Repository-level context in all analyses
   - Dependency-aware explanations
   - Business logic inference

2. **Modernization Intelligence**
   - Pattern recognition for legacy code
   - Best practice recommendations
   - Language-specific improvements

3. **Risk Assessment**
   - Security vulnerability detection
   - Technical debt quantification
   - Maintenance burden estimation

4. **Automated Artifact Generation**
   - Test case creation
   - Documentation generation
   - Migration planning

### IBM Bob Provider Design

**Key Design Principles**:

1. **Provider Abstraction**: Clean interface for AI operations
2. **Context Enrichment**: All requests include repository context
3. **Confidence Scoring**: Transparent AI reliability metrics
4. **Structured Responses**: Consistent data format
5. **Error Handling**: Graceful degradation

**Context Passed to IBM Bob**:
```python
context = {
    "type": "function",
    "name": "calculate_total",
    "file_path": "src/billing.py",
    "dependencies": ["tax_calculator", "discount_service"],
    "risk_score": 0.75,
    "tech_debt_score": 0.60,
    "tags": ["complex", "long_function"],
    "line_range": "45-120"
}
```

This rich context enables IBM Bob to provide:
- Accurate explanations
- Relevant recommendations
- Impact-aware suggestions
- Dependency-conscious refactoring

## Scalability Considerations

### Current Architecture (MVP)
- In-memory caching
- Single-repository focus
- Synchronous parsing
- Local file system access

### Production Enhancements
- Redis/PostgreSQL for persistence
- Multi-repository support
- Async parsing with Celery
- S3/blob storage for repos
- Rate limiting for IBM Bob API
- Caching layer for AI responses
- WebSocket for real-time updates

## Security Considerations

1. **Input Validation**
   - Path traversal prevention
   - File size limits
   - Malicious code detection

2. **API Security**
   - CORS configuration
   - Rate limiting
   - API key management for IBM Bob

3. **Code Execution**
   - No eval() or exec() of user code
   - AST parsing only (safe)
   - Sandboxed analysis

## Performance Characteristics

**Parsing Performance**:
- Small repo (< 50 files): < 5 seconds
- Medium repo (50-200 files): 5-20 seconds
- Large repo (200-1000 files): 20-60 seconds

**Graph Rendering**:
- < 100 nodes: Instant
- 100-500 nodes: < 2 seconds
- 500-1000 nodes: 2-5 seconds

**IBM Bob Response Times**:
- Explanation: 1-3 seconds
- Analysis: 2-4 seconds
- Modernization: 3-6 seconds
- Test generation: 2-5 seconds

## Technology Choices Rationale

| Technology | Rationale |
|------------|-----------|
| **FastAPI** | Modern, fast, async support, automatic API docs |
| **Python AST** | Native, reliable, no external dependencies |
| **React + TypeScript** | Type safety, component reusability, ecosystem |
| **Cytoscape.js** | Powerful graph rendering, extensive layouts |
| **Tailwind CSS** | Rapid UI development, consistent design |
| **NetworkX** | Industry-standard graph analysis library |
| **Pydantic** | Data validation, serialization, type safety |

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Production Deployment            │
├─────────────────────────────────────────┤
│                                          │
│  Frontend (Vercel/Netlify)              │
│  ├── Static React build                 │
│  └── CDN distribution                   │
│                                          │
│  Backend (AWS/GCP/Azure)                │
│  ├── FastAPI on Uvicorn                 │
│  ├── Docker container                   │
│  └── Auto-scaling                       │
│                                          │
│  IBM Bob API                             │
│  └── Managed service                    │
│                                          │
└─────────────────────────────────────────┘
```

## Future Architecture Enhancements

1. **Multi-Language Support**
   - JavaScript/TypeScript parser (tree-sitter)
   - Java parser (JavaParser)
   - COBOL parser (enterprise focus)

2. **Advanced Graph Features**
   - Time-series analysis (code evolution)
   - Diff graphs (PR impact visualization)
   - Architecture diagrams (high-level views)

3. **Collaboration Features**
   - Team annotations
   - Shared modernization plans
   - Review workflows

4. **CI/CD Integration**
   - GitHub Actions plugin
   - GitLab CI integration
   - Automated PR analysis

## Conclusion

RepoGraph AI's architecture is designed for:
- **Clarity**: Clean separation of concerns
- **Extensibility**: Provider abstraction, modular design
- **Performance**: Efficient parsing and caching
- **Intelligence**: IBM Bob as the core reasoning engine
- **Scalability**: Ready for production enhancements

The system demonstrates how visual dependency analysis combined with AI-powered insights can transform legacy code modernization from a risky, time-consuming process into a guided, confident workflow.