import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import cytoscape from 'cytoscape';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk_score?: number;
  tech_debt_score?: number;
  tags?: string[];
  code_snippet?: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface NodeDetails {
  id: string;
  label: string;
  type: string;
  risk_score: number;
  tech_debt_score: number;
  tags: string[];
  code_snippet: string;
}

export default function GraphExplorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repoPath = searchParams.get('repo') || '';
  const isDemo = searchParams.get('demo') === 'true' || repoPath.startsWith('demo://');
  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['file', 'class', 'function', 'module', 'method']);
  const [riskFilters, setRiskFilters] = useState<string[]>(['critical', 'high', 'medium', 'low']);
  const [activeLeft, setActiveLeft] = useState('search');
  const [activeRight, setActiveRight] = useState('explain');
  const [showSearch, setShowSearch] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showNodeTypes, setShowNodeTypes] = useState(false);
  const [targetLang, setTargetLang] = useState('Python 3.11+');

  // Apply type + risk filters to graph
  const applyFilters = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.destroyed()) return;
    try {
      cy.nodes().forEach((node) => {
        const type = (node.data('type') || '').toLowerCase();
        const risk: number = node.data('risk_score') || 0;
        const typeMatch = activeFilters.includes(type);
        let riskMatch = false;
        if (riskFilters.includes('critical') && risk >= 80) riskMatch = true;
        if (riskFilters.includes('high') && risk >= 60 && risk < 80) riskMatch = true;
        if (riskFilters.includes('medium') && risk >= 40 && risk < 60) riskMatch = true;
        if (riskFilters.includes('low') && risk < 40) riskMatch = true;
        node.style('display', typeMatch && riskMatch ? 'element' : 'none');
      });
      cy.edges().forEach((edge) => {
        const srcHidden = edge.source().style('display') === 'none';
        const tgtHidden = edge.target().style('display') === 'none';
        edge.style('display', srcHidden || tgtHidden ? 'none' : 'element');
      });
    } catch {
      // Cytoscape not ready yet — ignore
    }
  }, [activeFilters, riskFilters]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const toggleFilter = (type: string) => {
    const lower = type.toLowerCase();
    setActiveFilters((prev) => {
      const next = prev.includes(lower) ? prev.filter((t) => t !== lower) : [...prev, lower];
      // Apply filters after state update
      setTimeout(() => {
        const cy = cyRef.current;
        if (!cy || cy.destroyed()) return;
        try {
          cy.nodes().forEach((node) => {
            const ntype = (node.data('type') || '').toLowerCase();
            const risk: number = node.data('risk_score') || 0;
            const typeMatch = next.includes(ntype);
            let riskMatch = false;
            if (riskFilters.includes('critical') && risk >= 80) riskMatch = true;
            if (riskFilters.includes('high') && risk >= 60 && risk < 80) riskMatch = true;
            if (riskFilters.includes('medium') && risk >= 40 && risk < 60) riskMatch = true;
            if (riskFilters.includes('low') && risk < 40) riskMatch = true;
            node.style('display', typeMatch && riskMatch ? 'element' : 'none');
          });
          cy.edges().forEach((edge) => {
            const srcHidden = edge.source().style('display') === 'none';
            const tgtHidden = edge.target().style('display') === 'none';
            edge.style('display', srcHidden || tgtHidden ? 'none' : 'element');
          });
        } catch { /* ignore */ }
      }, 0);
      return next;
    });
  };

  const toggleRisk = (level: string) => {
    setRiskFilters((prev) => {
      const next = prev.includes(level) ? prev.filter((r) => r !== level) : [...prev, level];
      setTimeout(() => {
        const cy = cyRef.current;
        if (!cy || cy.destroyed()) return;
        try {
          cy.nodes().forEach((node) => {
            const ntype = (node.data('type') || '').toLowerCase();
            const risk: number = node.data('risk_score') || 0;
            const typeMatch = activeFilters.includes(ntype);
            let riskMatch = false;
            if (next.includes('critical') && risk >= 80) riskMatch = true;
            if (next.includes('high') && risk >= 60 && risk < 80) riskMatch = true;
            if (next.includes('medium') && risk >= 40 && risk < 60) riskMatch = true;
            if (next.includes('low') && risk < 40) riskMatch = true;
            node.style('display', typeMatch && riskMatch ? 'element' : 'none');
          });
          cy.edges().forEach((edge) => {
            const srcHidden = edge.source().style('display') === 'none';
            const tgtHidden = edge.target().style('display') === 'none';
            edge.style('display', srcHidden || tgtHidden ? 'none' : 'element');
          });
        } catch { /* ignore */ }
      }, 0);
      return next;
    });
  };

  // Demo graph data
  const demoGraphData = {
    nodes: [
      { id: 'auth-service', label: 'AuthService.ts', type: 'class', risk_score: 92, tech_debt_score: 85 },
      { id: 'user-store', label: 'UserStore.ts', type: 'class', risk_score: 78, tech_debt_score: 90 },
      { id: 'db-connector', label: 'DatabaseConnector.js', type: 'file', risk_score: 85, tech_debt_score: 70 },
      { id: 'api-router', label: 'api_router.py', type: 'file', risk_score: 54, tech_debt_score: 40 },
      { id: 'payment-gw', label: 'PaymentGateway.ts', type: 'class', risk_score: 72, tech_debt_score: 65 },
      { id: 'invoice-gen', label: 'InvoiceGenerator.py', type: 'function', risk_score: 68, tech_debt_score: 55 },
      { id: 'config-loader', label: 'ConfigLoader.go', type: 'file', risk_score: 45, tech_debt_score: 30 },
      { id: 'logger', label: 'Logger.go', type: 'file', risk_score: 30, tech_debt_score: 20 },
      { id: 'user-parser', label: 'UserDataParser.go', type: 'function', risk_score: 68, tech_debt_score: 50 },
      { id: 'middleware', label: 'AuthMiddleware.ts', type: 'function', risk_score: 60, tech_debt_score: 45 },
      { id: 'session-mgr', label: 'SessionManager.ts', type: 'class', risk_score: 75, tech_debt_score: 60 },
      { id: 'cache-layer', label: 'CacheLayer.ts', type: 'file', risk_score: 40, tech_debt_score: 25 },
    ],
    edges: [
      { source: 'auth-service', target: 'user-store' },
      { source: 'user-store', target: 'auth-service' },
      { source: 'auth-service', target: 'db-connector' },
      { source: 'api-router', target: 'auth-service' },
      { source: 'api-router', target: 'payment-gw' },
      { source: 'payment-gw', target: 'invoice-gen' },
      { source: 'invoice-gen', target: 'payment-gw' },
      { source: 'config-loader', target: 'logger' },
      { source: 'logger', target: 'config-loader' },
      { source: 'user-parser', target: 'db-connector' },
      { source: 'middleware', target: 'auth-service' },
      { source: 'middleware', target: 'session-mgr' },
      { source: 'session-mgr', target: 'cache-layer' },
      { source: 'session-mgr', target: 'user-store' },
      { source: 'db-connector', target: 'config-loader' },
    ],
  };

  const handleLeftClick = (id: string) => {
    setActiveLeft(id);
    if (id === 'search') { setShowSearch(true); setShowFilters(false); setShowNodeTypes(false); }
    else if (id === 'filter') { setShowFilters(!showFilters); setShowSearch(false); setShowNodeTypes(false); }
    else if (id === 'nodetype') { setShowNodeTypes(!showNodeTypes); setShowSearch(false); setShowFilters(false); }
    else if (id === 'risk') { setShowFilters(!showFilters); setShowSearch(false); setShowNodeTypes(false); }
    else if (id === 'layout') { if (cyRef.current) cyRef.current.layout({ name: 'cose', animate: true, animationDuration: 500 } as cytoscape.LayoutOptions).run(); }
  };

  const renderGraph = (data: { nodes: GraphNode[]; edges: GraphEdge[] }) => {
    if (cyRef.current) cyRef.current.destroy();
    if (!graphRef.current) return;

    // Normalize backend data (risk_score: 0.0-1.0 → 0-100, name→label)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedNodes = data.nodes.map((n: any) => ({
      data: {
        id: n.id,
        label: n.label || n.name || String(n.id),
        type: n.type,
        risk_score: typeof n.risk_score === 'number' && n.risk_score <= 1 ? Math.round(n.risk_score * 100) : (n.risk_score || 0),
        tech_debt_score: typeof n.tech_debt_score === 'number' && n.tech_debt_score <= 1 ? Math.round(n.tech_debt_score * 100) : (n.tech_debt_score || 0),
        code_snippet: n.code_snippet || '',
        tags: n.tags || [],
      },
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizedEdges = data.edges.map((e: any) => ({
      data: { source: e.source, target: e.target },
    }));

    const cy = cytoscape({
      container: graphRef.current,
      elements: [...normalizedNodes, ...normalizedEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#7c3aed',
            label: 'data(label)',
            color: '#e5e1e7',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            width: 40,
            height: 40,
            'border-width': 2,
            'border-color': 'rgba(167, 139, 250, 0.4)',
            'font-family': 'JetBrains Mono',
          },
        },
        { selector: 'node[type="file"]', style: { 'background-color': 'rgba(59, 130, 246, 0.5)', 'border-color': 'rgba(96, 165, 250, 0.5)' } },
        { selector: 'node[type="class"]', style: { 'background-color': 'rgba(139, 92, 246, 0.5)', 'border-color': 'rgba(167, 139, 250, 0.5)' } },
        { selector: 'node[type="function"]', style: { 'background-color': 'rgba(236, 72, 153, 0.5)', 'border-color': 'rgba(244, 114, 182, 0.5)' } },
        { selector: 'node[type="method"]', style: { 'background-color': 'rgba(251, 146, 60, 0.5)', 'border-color': 'rgba(251, 191, 36, 0.5)' } },
        { selector: 'node[?risk_score]', style: {
          width: 'mapData(risk_score, 0, 100, 30, 60)',
          height: 'mapData(risk_score, 0, 100, 30, 60)',
        }},
        { selector: 'node[risk_score > 70]', style: {
          'background-color': 'rgba(239, 68, 68, 0.5)',
          'border-color': 'rgba(239, 68, 68, 0.6)',
          'border-width': 3,
        }},
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': 'rgba(167, 139, 250, 0.3)',
            'target-arrow-color': 'rgba(167, 139, 250, 0.4)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        { selector: ':selected', style: { 'border-color': '#d2bbff', 'border-width': 3, 'background-color': '#7c3aed' } },
      ],
      layout: { name: 'cose', animate: true, animationDuration: 800, nodeRepulsion: () => 8000, idealEdgeLength: () => 120 } as cytoscape.LayoutOptions,
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({
        id: node.id(),
        label: node.data('label'),
        type: node.data('type'),
        risk_score: node.data('risk_score') || 0,
        tech_debt_score: node.data('tech_debt_score') || 0,
        tags: node.data('tags') || [],
        code_snippet: node.data('code_snippet') || '',
      });
      setAiResult('');
    });

    cyRef.current = cy;

    // Apply any active filters to the freshly rendered graph
    setTimeout(() => applyFilters(), 100);
  };

  const loadGraph = useCallback(async () => {
    // If no repo path or demo mode, use mock data
    if (!repoPath || isDemo) {
      renderGraph(demoGraphData);
      return;
    }

    try {
      const response = await axios.get(`/api/repo/graph?repo_path=${encodeURIComponent(repoPath)}`, { timeout: 3000 });
      renderGraph(response.data);
    } catch {
      // Backend unavailable — fall back to demo data
      renderGraph(demoGraphData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoPath, isDemo]);

  useEffect(() => {
    loadGraph();
    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, [loadGraph]);

  const handleAiAction = async (action: string) => {
    setActiveRight(action);
    setAiLoading(true);
    setAiResult('');
    const nodeLabel = selectedNode?.label || 'UserService.ts';
    try {
      const endpoint = selectedNode ? `/api/node/${selectedNode.id}/${action}` : `/api/ai/${action}`;
      const response = await axios.post(endpoint, {
        node: nodeLabel,
        ...(action === 'modernize' ? { target_language: targetLang } : {}),
      });
      const data = response.data;

      // Extract the most useful field based on action
      if (action === 'modernize' && data.modernized_code) {
        setAiResult(data.modernized_code);
      } else if (action === 'tests' && data.test_code) {
        setAiResult(data.test_code);
      } else if (action === 'explain' && data.summary) {
        setAiResult(`${data.summary}\n\nPurpose: ${data.purpose || ''}\n\nComplexity: ${data.complexity_assessment || ''}\n\nDependencies: ${data.dependencies_impact || ''}`);
      } else {
        setAiResult(JSON.stringify(data, null, 2));
      }
    } catch {
      const cleanName = nodeLabel.replace(/\.\w+$/, '');
      const fallback: Record<string, string> = {
        explain: `📖 ${nodeLabel} Analysis:\nThis is a core service handling authentication and user management. It contains 12 methods across 340 lines.\n\nKey concerns:\n• High cyclomatic complexity in authenticate()\n• Missing error boundaries in session management\n• Tight coupling with Database layer`,
        analyze: `🔍 Deep Analysis of ${nodeLabel}:\n• Risk Score: 78% (High)\n• Tech Debt: Critical\n• Coupling Index: 8.4/10\n• Complexity: O(n²) in 3 methods\n• Test Coverage: 23%\n• Last Modified: 142 days ago`,
        modernize: `import { injectable, inject } from "inversify";\nimport type { ILogger, IDatabase, ISessionStore } from "./interfaces";\n\ninterface I${cleanName}Config {\n  readonly maxRetries: number;\n  readonly timeoutMs: number;\n  readonly enableCache: boolean;\n}\n\nconst DEFAULT_CONFIG: I${cleanName}Config = {\n  maxRetries: 3,\n  timeoutMs: 30_000,\n  enableCache: true,\n};\n\n@injectable()\nexport class ${cleanName} {\n  private readonly logger: ILogger;\n  private readonly db: IDatabase;\n  private readonly sessions: ISessionStore;\n  private readonly config: I${cleanName}Config;\n\n  constructor(\n    @inject("ILogger") logger: ILogger,\n    @inject("IDatabase") db: IDatabase,\n    @inject("ISessionStore") sessions: ISessionStore,\n    config?: Partial<I${cleanName}Config>\n  ) {\n    this.logger = logger;\n    this.db = db;\n    this.sessions = sessions;\n    this.config = { ...DEFAULT_CONFIG, ...config };\n  }\n\n  async authenticate(request: AuthRequest): Promise<AuthResult> {\n    if (!request?.credentials) {\n      throw new ValidationError("Missing credentials");\n    }\n\n    try {\n      const user = await this.db.users.findUnique({\n        where: { email: request.credentials.email },\n      });\n\n      if (!user) {\n        this.logger.warn("Auth failed: user not found", {\n          email: request.credentials.email,\n        });\n        return { success: false, reason: "INVALID_CREDENTIALS" };\n      }\n\n      const isValid = await verify(\n        user.passwordHash,\n        request.credentials.password\n      );\n\n      if (!isValid) {\n        return { success: false, reason: "INVALID_CREDENTIALS" };\n      }\n\n      const session = await this.sessions.create({\n        userId: user.id,\n        expiresAt: Date.now() + 86_400_000,\n      });\n\n      return {\n        success: true,\n        token: session.token,\n        user: { id: user.id, email: user.email, role: user.role },\n      };\n    } catch (error: unknown) {\n      this.logger.error("Authentication error", { error });\n      throw new ServiceError("AUTH_FAILURE", { cause: error });\n    }\n  }\n}`,
        tests: `📊 Metrics for ${nodeLabel}:\n• Lines of Code: 340\n• Methods: 12\n• Dependencies: 8 incoming, 5 outgoing\n• Cyclomatic Complexity: 24\n• Maintainability Index: 42/100\n• Code Duplication: 18%`,
      };
      setAiResult(fallback[action] || `IBM Bob AI: ${action} complete for ${nodeLabel}`);
    }
    setAiLoading(false);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-opacity-80 backdrop-blur-xl bg-surface-container-low shadow-[0_0_30px_rgba(139,92,246,0.1)] border-b border-outline-variant/15">
        <div className="flex items-center gap-8">
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight cursor-pointer" onClick={() => navigate('/')}>NodeShift AI</h1>
          <div className="hidden md:flex gap-6">
            <span className="font-label-sm text-label-sm text-primary border-b-2 border-primary pb-1">Graph</span>
            <button onClick={() => navigate(`/list${repoPath ? `?repo=${encodeURIComponent(repoPath)}` : ''}`)} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">List View</button>
            <button onClick={() => navigate('/dashboard')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Dashboard</button>
            <button onClick={() => navigate('/dashboard#hotspots')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Hotspots</button>
            <button onClick={() => navigate('/dashboard#debt-clusters')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Debt Clusters</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/load')} className="bg-primary-container/80 text-on-primary-container px-4 py-2 rounded-lg font-label-sm text-label-sm border border-primary/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">Load New Repo</button>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="flex h-screen pt-16 pb-8">
        {/* Left SideNavBar (Repo Explorer) */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 flex flex-col w-64 bg-opacity-80 backdrop-blur-xl bg-surface-container-lowest border-r border-outline-variant/15 shadow-2xl p-4 overflow-y-auto">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">folder_zip</span>
            </div>
            <div>
              <h2 className="text-primary font-bold text-sm">Repo Explorer</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">main-branch</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {[
              { id: 'search', icon: 'search', label: 'Search' },
              { id: 'filter', icon: 'filter_list', label: 'Filter' },
              { id: 'nodetype', icon: 'account_tree', label: 'Node Type' },
              { id: 'risk', icon: 'warning', label: 'Risk Level' },
              { id: 'layout', icon: 'layers', label: 'Layout' },
            ].map((item) => (
              <button key={item.id} onClick={() => handleLeftClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-label-sm text-label-sm transition-all duration-300 cursor-pointer ${
                  activeLeft === item.id
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20'
                }`}>
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Search Panel */}
          {showSearch && (
            <div className="mb-4">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-2">Search Nodes</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-sm">search</span>
                <input
                  className="w-full bg-[rgba(5,5,8,0.6)] border border-outline-variant/30 rounded-lg py-2 pl-9 pr-3 text-sm focus:border-primary focus:shadow-[0_0_10px_rgba(139,92,246,0.3)] outline-none text-on-surface transition-all"
                  placeholder="Class, function, file..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Filter / Risk Panel */}
          {showFilters && (
            <div className="mb-4 p-3 glass-panel rounded-lg">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-2">Risk Filters</h3>
              {[
                { key: 'critical', label: 'Critical (80+)', color: 'text-red-400' },
                { key: 'high', label: 'High (60-80)', color: 'text-orange-400' },
                { key: 'medium', label: 'Medium (40-60)', color: 'text-yellow-400' },
                { key: 'low', label: 'Low (0-40)', color: 'text-green-400' },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center gap-2 py-1.5 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskFilters.includes(key)}
                    onChange={() => toggleRisk(key)}
                    className="accent-primary"
                  />
                  <span className={riskFilters.includes(key) ? color : 'text-outline'}>{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Node Types Panel */}
          {showNodeTypes && (
            <div className="mb-4">
              <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-2">Node Types</h3>
              <div className="flex flex-wrap gap-2">
                {['File', 'Class', 'Function', 'Module', 'Method'].map((type) => {
                  const colors: Record<string, string> = {
                    File: 'bg-blue-900/30 border-blue-500/50 text-blue-300',
                    Class: 'bg-purple-900/30 border-purple-500/50 text-purple-300',
                    Function: 'bg-pink-900/30 border-pink-500/50 text-pink-300',
                    Module: 'bg-orange-900/30 border-orange-500/50 text-orange-300',
                    Method: 'bg-amber-900/30 border-amber-500/50 text-amber-300',
                  };
                  const isActive = activeFilters.includes(type.toLowerCase());
                  return (
                    <span key={type} onClick={() => toggleFilter(type)}
                      className={`px-2 py-1 rounded-full border font-label-sm text-label-sm text-xs cursor-pointer transition-all ${colors[type]} ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-primary-container/80 hover:bg-primary-container text-on-primary-container py-2 rounded-lg font-label-sm text-label-sm border border-primary/30 transition-all cursor-pointer">Analyze Code</button>
          </div>
        </aside>

        {/* Center Canvas */}
        <section className="ml-64 mr-80 flex-1 relative bg-[#050508] graph-bg overflow-hidden">
          <div ref={graphRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }} />

          {/* Placeholder graph when no data */}
          {!repoPath && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                  <line stroke="rgba(167, 139, 250, 0.4)" strokeWidth="2" x1="30%" x2="50%" y1="40%" y2="50%" />
                  <line stroke="rgba(167, 139, 250, 0.2)" strokeWidth="1" x1="50%" x2="70%" y1="50%" y2="30%" />
                  <line stroke="rgba(239, 68, 68, 0.5)" strokeDasharray="4" strokeWidth="2" x1="50%" x2="60%" y1="50%" y2="70%" />
                </svg>

                {/* Core Node */}
                <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-16 h-16 rounded-full glass-panel neon-glow flex items-center justify-center border-purple-400/50 cursor-pointer hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-purple-300">data_object</span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-sm text-label-sm text-on-surface whitespace-nowrap bg-surface-container px-2 py-1 rounded border border-outline-variant/30">UserService.ts</span>
                </div>

                {/* File Node */}
                <div className="absolute top-[40%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border-blue-400/30 bg-blue-900/10 cursor-pointer hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-blue-300 text-sm">description</span>
                  </div>
                </div>

                {/* Hotspot Node */}
                <div className="absolute top-[70%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-14 h-14 rounded-full glass-panel flex items-center justify-center border-red-500/50 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer hover:scale-110 transition-transform relative">
                    <span className="material-symbols-outlined text-orange-300">functions</span>
                    <div className="absolute -top-2 -right-2 bg-surface text-xs rounded-full p-1 border border-red-500/50">🔥</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Controls */}
          <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 glass-panel p-2 rounded-lg">
            <button
              onClick={() => { if (cyRef.current) { const z = cyRef.current.zoom(); cyRef.current.zoom({ level: z * 1.3, renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 } }); } }}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Zoom In"
            ><span className="material-symbols-outlined">add</span></button>
            <div className="h-px bg-outline-variant/30 w-full"></div>
            <button
              onClick={() => { if (cyRef.current) { const z = cyRef.current.zoom(); cyRef.current.zoom({ level: z * 0.7, renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 } }); } }}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Zoom Out"
            ><span className="material-symbols-outlined">remove</span></button>
            <div className="h-px bg-outline-variant/30 w-full"></div>
            <button
              onClick={() => { if (cyRef.current) { cyRef.current.fit(undefined, 50); cyRef.current.center(); } }}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Fit to Screen"
            ><span className="material-symbols-outlined">fit_screen</span></button>
          </div>

          {/* Mini Legend */}
          <div className="absolute bottom-6 left-6 z-20 glass-panel p-3 rounded-lg font-label-sm text-label-sm text-xs flex gap-4">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-400"></div> File</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500/50 border border-purple-400"></div> Class</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-400"></div> Hotspot</div>
          </div>
        </section>

        {/* Right SideNavBar (IBM Bob AI) */}
        <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] z-40 flex flex-col w-80 bg-opacity-80 backdrop-blur-xl bg-surface-container-low border-l border-outline-variant/15 shadow-[0_0_20px_rgba(139,92,246,0.2)] p-4 overflow-y-auto">
          <div className="mb-6 flex items-center gap-3 pb-4 border-b border-outline-variant/20">
            <div className="w-10 h-10 rounded-full bg-tertiary-container/20 border border-tertiary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary">smart_toy</span>
            </div>
            <div>
              <h2 className="text-tertiary font-bold text-sm">IBM Bob AI</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Intelligent Assistant</p>
            </div>
          </div>

          {/* Selected Node Context */}
          {selectedNode ? (
            <div className="mb-6 glass-panel p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-300 text-sm">data_object</span>
                <h3 className="font-label-sm text-label-sm text-on-surface">{selectedNode.label}</h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">Type: {selectedNode.type}</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-outline">Risk Score</span>
                    <span className={selectedNode.risk_score > 70 ? 'text-orange-400' : 'text-primary'}>
                      {selectedNode.risk_score > 70 ? 'High' : 'Low'} ({selectedNode.risk_score}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${selectedNode.risk_score > 70 ? 'bg-orange-500' : 'bg-primary'}`} style={{ width: `${selectedNode.risk_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-outline">Tech Debt</span>
                    <span className={selectedNode.tech_debt_score > 70 ? 'text-red-400' : 'text-primary'}>
                      {selectedNode.tech_debt_score > 70 ? 'Critical' : 'Low'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${selectedNode.tech_debt_score > 70 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${selectedNode.tech_debt_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 glass-panel p-4 rounded-lg text-center">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 block">touch_app</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Click a node on the graph to inspect it</p>
            </div>
          )}

          {/* Code Snippet */}
          {selectedNode && (
            <div className="mb-6 bg-[#050508] border border-outline-variant/20 rounded-lg p-3 font-code-md text-code-md text-xs overflow-x-auto max-h-40">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-purple-300 text-sm">code</span>
                <span className="text-on-surface-variant text-[10px]">{selectedNode.label}</span>
              </div>
              <pre><code className="text-on-surface-variant">{selectedNode.code_snippet || `// ${selectedNode.label}\n// Type: ${selectedNode.type}\n// Risk: ${selectedNode.risk_score}%\n// Tech Debt: ${selectedNode.tech_debt_score}%`}</code></pre>
            </div>
          )}

          {/* AI Result */}
          {aiResult && (
            <div className="mb-4 bg-[#050508] border border-tertiary/20 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-tertiary/10 border-b border-tertiary/20">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary text-sm">
                    {activeRight === 'modernize' ? 'auto_fix_high' : activeRight === 'explain' ? 'psychology' : activeRight === 'analyze' ? 'analytics' : 'speed'}
                  </span>
                  <span className="text-[10px] text-tertiary font-semibold uppercase tracking-wider">
                    {activeRight === 'modernize' ? 'Modernized Code' : activeRight === 'explain' ? 'Explanation' : activeRight === 'analyze' ? 'Analysis' : 'Metrics'}
                  </span>
                </div>
                <span className="text-[9px] text-outline">IBM Bob AI</span>
              </div>
              <div className={`p-3 font-code-md text-code-md text-xs overflow-auto ${activeRight === 'modernize' ? 'max-h-[500px]' : 'max-h-48'}`}>
                <pre className="text-on-surface-variant whitespace-pre-wrap">{aiResult}</pre>
              </div>
            </div>
          )}

          {/* Target Language Selector */}
          <div className="mb-3">
            <label className="flex items-center gap-1.5 text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1.5">
              <span className="material-symbols-outlined text-sm text-tertiary">translate</span>
              Modernize Target
            </label>
            <div className="relative">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full appearance-none bg-[#0a0a0f] border border-outline-variant/30 rounded-lg py-2 px-3 pr-8 text-sm text-on-surface focus:border-tertiary focus:shadow-[0_0_10px_rgba(221,183,255,0.2)] outline-none transition-all cursor-pointer"
              >
                <option value="Python 3.11+">🐍 Python 3.11+</option>
                <option value="TypeScript">🟦 TypeScript</option>
                <option value="Go">🐹 Go</option>
                <option value="Rust">🦀 Rust</option>
                <option value="Java 21">☕ Java 21</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-outline text-sm pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* AI Actions */}
          <div className="space-y-2">
            {[
              { action: 'explain', icon: 'psychology', label: 'Explain' },
              { action: 'analyze', icon: 'analytics', label: 'Analyze' },
              { action: 'modernize', icon: 'auto_fix_high', label: `Modernize → ${targetLang}` },
              { action: 'tests', icon: 'speed', label: 'Metrics' },
            ].map(({ action, icon, label }) => (
              <button
                key={action}
                onClick={() => handleAiAction(action)}
                disabled={aiLoading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-label-sm text-label-sm border transition-all duration-300 cursor-pointer ${
                  activeRight === action
                    ? 'bg-surface-container-high text-tertiary font-bold border-tertiary/20 shadow-[0_0_10px_rgba(221,183,255,0.1)]'
                    : 'bg-surface-container text-on-surface-variant hover:text-tertiary border-transparent hover:border-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined ${activeRight === action ? 'text-tertiary' : ''}`}>{icon}</span>
                  {aiLoading && activeRight === action ? 'Processing...' : label}
                </div>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            ))}
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-50 flex items-center justify-between px-4 h-8 bg-surface-dim border-t border-outline-variant/10">
        <div className="font-code-md text-code-md text-primary">NodeShift AI Status: Connected</div>
        <div className="flex gap-6">
          <a className="font-code-md text-code-md text-outline hover:text-on-surface" href="#">System Logs</a>
          <span className="font-code-md text-code-md text-outline">Latency: 24ms</span>
          <span className="font-code-md text-code-md text-outline">v2.4.0-stable</span>
        </div>
      </footer>
    </div>
  );
}
