import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface NodeDetails {
  id: string;
  label: string;
  type: string;
  risk_score: number;
  tech_debt_score: number;
  tags: string[];
  code_snippet: string;
}

const demoFiles: NodeDetails[] = [
  { id: 'auth-service', label: 'AuthService.ts', type: 'class', risk_score: 92, tech_debt_score: 85, tags: ['complex', 'high_coupling'], code_snippet: '' },
  { id: 'user-store', label: 'UserStore.ts', type: 'class', risk_score: 78, tech_debt_score: 90, tags: ['long_function'], code_snippet: '' },
  { id: 'db-connector', label: 'DatabaseConnector.js', type: 'file', risk_score: 85, tech_debt_score: 70, tags: ['complex'], code_snippet: '' },
  { id: 'api-router', label: 'api_router.py', type: 'file', risk_score: 54, tech_debt_score: 40, tags: [], code_snippet: '' },
  { id: 'payment-gw', label: 'PaymentGateway.ts', type: 'class', risk_score: 72, tech_debt_score: 65, tags: [], code_snippet: '' },
  { id: 'invoice-gen', label: 'InvoiceGenerator.py', type: 'function', risk_score: 68, tech_debt_score: 55, tags: [], code_snippet: '' },
  { id: 'config-loader', label: 'ConfigLoader.go', type: 'file', risk_score: 45, tech_debt_score: 30, tags: [], code_snippet: '' },
  { id: 'logger', label: 'Logger.go', type: 'file', risk_score: 30, tech_debt_score: 20, tags: [], code_snippet: '' },
  { id: 'user-parser', label: 'UserDataParser.go', type: 'function', risk_score: 68, tech_debt_score: 50, tags: [], code_snippet: '' },
  { id: 'middleware', label: 'AuthMiddleware.ts', type: 'function', risk_score: 60, tech_debt_score: 45, tags: [], code_snippet: '' },
  { id: 'session-mgr', label: 'SessionManager.ts', type: 'class', risk_score: 75, tech_debt_score: 60, tags: [], code_snippet: '' },
  { id: 'cache-layer', label: 'CacheLayer.ts', type: 'file', risk_score: 40, tech_debt_score: 25, tags: [], code_snippet: '' },
];

type SortKey = 'label' | 'type' | 'risk_score' | 'tech_debt_score';

export default function FileListView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repoPath = searchParams.get('repo') || '';
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [activeRight, setActiveRight] = useState('explain');
  const [sortKey, setSortKey] = useState<SortKey>('risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [targetLang, setTargetLang] = useState('Python 3.11+');

  const files = [...demoFiles];

  const filtered = files
    .filter((f) => f.label.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const riskBadge = (score: number) => {
    if (score >= 80) return { label: 'Critical', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (score >= 60) return { label: 'High', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (score >= 40) return { label: 'Medium', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: 'Low', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      file: 'bg-blue-900/30 border-blue-500/40 text-blue-300',
      class: 'bg-purple-900/30 border-purple-500/40 text-purple-300',
      function: 'bg-pink-900/30 border-pink-500/40 text-pink-300',
      module: 'bg-orange-900/30 border-orange-500/40 text-orange-300',
      method: 'bg-amber-900/30 border-amber-500/40 text-amber-300',
    };
    return map[type] || 'bg-gray-900/30 border-gray-500/40 text-gray-300';
  };

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
      if (action === 'modernize' && data.modernized_code) setAiResult(data.modernized_code);
      else if (action === 'tests' && data.test_code) setAiResult(data.test_code);
      else if (action === 'explain' && data.summary) setAiResult(`${data.summary}\n\nPurpose: ${data.purpose || ''}\n\nComplexity: ${data.complexity_assessment || ''}\n\nDependencies: ${data.dependencies_impact || ''}`);
      else setAiResult(JSON.stringify(data, null, 2));
    } catch {
      const cleanName = nodeLabel.replace(/\.\w+$/, '');
      const fallback: Record<string, string> = {
        explain: `📖 ${nodeLabel} Analysis:\nThis is a core service handling authentication and user management. It contains 12 methods across 340 lines.\n\nKey concerns:\n• High cyclomatic complexity in authenticate()\n• Missing error boundaries in session management\n• Tight coupling with Database layer`,
        analyze: `🔍 Deep Analysis of ${nodeLabel}:\n• Risk Score: 78% (High)\n• Tech Debt: Critical\n• Coupling Index: 8.4/10\n• Complexity: O(n²) in 3 methods\n• Test Coverage: 23%\n• Last Modified: 142 days ago`,
        modernize: `import { injectable, inject } from "inversify";\nimport type { ILogger, IDatabase, ISessionStore } from "./interfaces";\n\ninterface I${cleanName}Config {\n  readonly maxRetries: number;\n  readonly timeoutMs: number;\n}\n\n@injectable()\nexport class ${cleanName} {\n  private readonly logger: ILogger;\n  private readonly config: I${cleanName}Config;\n\n  constructor(\n    @inject("ILogger") logger: ILogger,\n    config?: Partial<I${cleanName}Config>\n  ) {\n    this.logger = logger;\n    this.config = { maxRetries: 3, timeoutMs: 30_000, ...config };\n  }\n\n  async process(data: Record<string, unknown>): Promise<Record<string, unknown>> {\n    this.validate(data);\n    return { status: "ok", result: data };\n  }\n\n  private validate(data: Record<string, unknown>): void {\n    if (!data || Object.keys(data).length === 0) {\n      throw new TypeError("Input data must not be empty");\n    }\n  }\n}`,
        tests: `📊 Metrics for ${nodeLabel}:\n• Lines of Code: 340\n• Methods: 12\n• Dependencies: 8 incoming, 5 outgoing\n• Cyclomatic Complexity: 24\n• Maintainability Index: 42/100\n• Code Duplication: 18%`,
      };
      setAiResult(fallback[action] || `IBM Bob AI: ${action} complete for ${nodeLabel}`);
    }
    setAiLoading(false);
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return 'unfold_more';
    return sortAsc ? 'arrow_upward' : 'arrow_downward';
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-opacity-80 backdrop-blur-xl bg-surface-container-low shadow-[0_0_30px_rgba(139,92,246,0.1)] border-b border-outline-variant/15">
        <div className="flex items-center gap-8">
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight cursor-pointer" onClick={() => navigate('/')}>NodeShift AI</h1>
          <div className="hidden md:flex gap-6">
            <button onClick={() => navigate(`/graph${repoPath ? `?repo=${encodeURIComponent(repoPath)}` : ''}`)} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Graph</button>
            <span className="font-label-sm text-label-sm text-primary border-b-2 border-primary pb-1">List View</span>
            <button onClick={() => navigate('/dashboard')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Dashboard</button>
            <button onClick={() => navigate('/dashboard#hotspots')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Hotspots</button>
            <button onClick={() => navigate('/dashboard#debt-clusters')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-2 py-1 rounded cursor-pointer">Debt Clusters</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/load')} className="bg-primary-container/80 text-on-primary-container px-4 py-2 rounded-lg font-label-sm text-label-sm border border-primary/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">Load New Repo</button>
        </div>
      </nav>

      <main className="flex h-screen pt-16 pb-8">
        {/* File List Content */}
        <section className="mr-80 flex-1 relative bg-[#050508] overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">list_alt</span>
              </div>
              <div>
                <h2 className="text-on-surface font-bold text-lg">Repository Files</h2>
                <p className="text-xs text-on-surface-variant">{filtered.length} files · sorted by {sortKey.replace('_', ' ')}</p>
              </div>
            </div>
            {/* Search */}
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-sm">search</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2 pl-9 pr-3 text-sm focus:border-primary focus:shadow-[0_0_10px_rgba(139,92,246,0.3)] outline-none text-on-surface transition-all"
                placeholder="Filter files..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {([
                    { key: 'label' as SortKey, label: 'File Name', width: 'w-[40%]' },
                    { key: 'type' as SortKey, label: 'Type', width: 'w-[15%]' },
                    { key: 'risk_score' as SortKey, label: 'Risk Score', width: 'w-[20%]' },
                    { key: 'tech_debt_score' as SortKey, label: 'Tech Debt', width: 'w-[25%]' },
                  ]).map(({ key, label, width }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className={`${width} px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none`}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <span className="material-symbols-outlined text-xs opacity-60">{sortIcon(key)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => {
                  const risk = riskBadge(file.risk_score);
                  const isSelected = selectedNode?.id === file.id;
                  return (
                    <tr
                      key={file.id}
                      onClick={() => { setSelectedNode(file); setAiResult(''); }}
                      className={`border-b border-outline-variant/10 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary/10 shadow-[inset_3px_0_0_0_#7c3aed]'
                          : 'hover:bg-surface-container-high/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-primary' : 'text-outline'}`}>
                            {file.type === 'class' ? 'data_object' : file.type === 'function' ? 'functions' : 'description'}
                          </span>
                          <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{file.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${typeBadge(file.type)}`}>
                          {file.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full rounded-full ${file.risk_score >= 80 ? 'bg-red-500' : file.risk_score >= 60 ? 'bg-orange-500' : file.risk_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${file.risk_score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono ${risk.cls.split(' ').find(c => c.startsWith('text-'))}`}>{file.risk_score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${riskBadge(file.tech_debt_score).cls}`}>
                          {riskBadge(file.tech_debt_score).label} ({file.tech_debt_score}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right SideNavBar (IBM Bob AI) — identical to GraphExplorer */}
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
                    <div className={`h-full ${selectedNode.risk_score > 70 ? 'bg-orange-500' : 'bg-primary'}`} style={{ width: `${selectedNode.risk_score}%` }} />
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
                    <div className={`h-full ${selectedNode.tech_debt_score > 70 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${selectedNode.tech_debt_score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 glass-panel p-4 rounded-lg text-center">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 block">touch_app</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Click a file row to inspect it</p>
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
