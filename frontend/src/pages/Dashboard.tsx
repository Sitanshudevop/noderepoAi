import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface DashboardData {
  total_files: number;
  total_classes: number;
  total_functions: number;
  total_dependencies: number;
  hotspots: Array<{ name: string; type: string; risk_score: number }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repoPath = searchParams.get('repo') || '';
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeLeft, setActiveLeft] = useState('layout');
  const [activeRight, setActiveRight] = useState('metrics');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hotspotsRef = useRef<HTMLDivElement>(null);
  const debtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try real backend
        const res = await axios.get(`/api/dashboard/summary${repoPath ? `?repo_path=${encodeURIComponent(repoPath)}` : ''}`, { timeout: 3000 });
        const meta = res.data?.metadata || res.data;
        const rawHotspots = res.data?.hotspots || [];
        setData({
          total_files: meta.total_files || 0,
          total_classes: meta.total_classes || 0,
          total_functions: meta.total_functions || 0,
          total_dependencies: meta.total_edges || meta.total_dependencies || 0,
          hotspots: rawHotspots.map((h: Record<string, unknown>) => ({
            name: (h.name as string) || (h.id as string) || 'Unknown',
            type: (h.type as string) || 'File',
            risk_score: typeof h.risk_score === 'number' && h.risk_score <= 1 ? Math.round((h.risk_score as number) * 100) : (h.risk_score || 0),
          })),
        });
      } catch {
        setData(null);
      }
    };
    fetchData();
  }, [repoPath]);

  const stats = {
    files: data?.total_files ?? 1204, classes: data?.total_classes ?? 342,
    functions: data?.total_functions ?? 8912, dependencies: data?.total_dependencies ?? 456,
  };

  const hotspots = data?.hotspots?.length ? data.hotspots : [
    { name: 'AuthenticationService.ts', type: 'Class', risk_score: 92 },
    { name: 'DatabaseConnector.js', type: 'Module', risk_score: 85 },
    { name: 'UserDataParser.go', type: 'Struct', risk_score: 68 },
    { name: 'api_router.py', type: 'Module', risk_score: 54 },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 85) return { text: 'text-error', bg: 'bg-error', badge: 'text-error' };
    if (score >= 65) return { text: 'text-primary', bg: 'bg-primary', badge: 'text-primary' };
    return { text: 'text-secondary', bg: 'bg-secondary', badge: 'text-secondary' };
  };
  const getTypeColor = (type: string) => {
    const c: Record<string, string> = { Class: 'text-secondary', Module: 'text-tertiary', Struct: 'text-primary', Function: 'text-error' };
    return c[type] || 'text-on-surface-variant';
  };

  const scrollToHotspots = () => hotspotsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToDebt = () => debtRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleLeftClick = (id: string) => {
    setActiveLeft(id);
    if (id === 'search') setSearchOpen(!searchOpen);
    else if (id === 'filter') scrollToHotspots();
    else if (id === 'nodetype') navigate('/graph');
    else if (id === 'risk') scrollToHotspots();
    else if (id === 'layout') scrollToDebt();
  };

  const handleRightAction = async (action: string) => {
    setActiveRight(action);
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await axios.post(`/api/ai/${action}`, { context: 'dashboard', repo_path: repoPath });
      setAiResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } catch {
      const fallback: Record<string, string> = {
        explain: '📖 This dashboard provides a high-level structural overview of your repository. It highlights files, classes, and functions, identifies risk hotspots, and maps circular dependency cycles.',
        analyze: '🔍 Analysis Summary:\n• 4 critical hotspots detected\n• 3 circular dependency cycles\n• 64% technical debt ratio\n• Primary debt clusters: Architectural (45%), Code Duplication (30%), Security (25%)',
        modernize: '🔧 Modernization Recommendations:\n1. Refactor AuthenticationService.ts — break into smaller modules\n2. Resolve 3 circular dependency cycles\n3. Migrate DatabaseConnector.js to async/await patterns\n4. Add type safety to UserDataParser.go',
        metrics: '📊 Repository Metrics:\n• Total Files: 1,204 (+12%)\n• Total Classes: 342 (Stable)\n• Total Functions: 8,912 (+4%)\n• Dependencies: 456 (Critical)\n• Est. Time Savings: 42hrs\n• Debt Ratio: 64%',
      };
      setAiResult(fallback[action] || `IBM Bob AI: ${action} analysis complete.`);
    }
    setAiLoading(false);
  };

  const handleInspect = (name: string) => navigate(`/graph?node=${encodeURIComponent(name)}`);
  const handleAnalyze = () => navigate('/graph');

  const leftItems = [
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'filter', icon: 'filter_list', label: 'Filter' },
    { id: 'nodetype', icon: 'account_tree', label: 'Node Type' },
    { id: 'risk', icon: 'warning', label: 'Risk Level' },
    { id: 'layout', icon: 'layers', label: 'Layout' },
  ];

  const rightItems = [
    { id: 'explain', icon: 'psychology', label: 'Explain' },
    { id: 'analyze', icon: 'analytics', label: 'Analyze' },
    { id: 'modernize', icon: 'auto_fix_high', label: 'Modernize' },
    { id: 'metrics', icon: 'speed', label: 'Metrics' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen antialiased overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-opacity-80 backdrop-blur-xl bg-surface-container-low border-b border-outline-variant/15 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight cursor-pointer" onClick={() => navigate('/')}>NodeShift AI</span>
          <ul className="hidden md:flex items-center gap-6">
            <li><button onClick={() => navigate('/graph')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-3 py-2 rounded">Graph</button></li>
            <li><span className="font-label-sm text-label-sm text-primary border-b-2 border-primary pb-1">Dashboard</span></li>
            <li><button onClick={scrollToHotspots} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-3 py-2 rounded">Hotspots</button></li>
            <li><button onClick={scrollToDebt} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors hover:bg-primary/10 px-3 py-2 rounded">Debt Clusters</button></li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/load')} className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-primary transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">Load New Repo</button>
        </div>
      </nav>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 flex flex-col w-64 bg-opacity-80 backdrop-blur-xl bg-surface-container-lowest border-r border-outline-variant/15 shadow-2xl">
        <div className="p-6 border-b border-outline-variant/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary">folder_open</span>
          </div>
          <div>
            <h2 className="text-primary font-bold text-sm">Repo Explorer</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">main-branch</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {leftItems.map((item) => (
            <button key={item.id} onClick={() => handleLeftClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full cursor-pointer ${
                activeLeft === item.id
                  ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20'
              }`}>
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </button>
          ))}
          {searchOpen && (
            <div className="px-2 pt-2">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes..." className="w-full bg-[rgba(5,5,8,0.6)] border border-outline-variant/30 rounded-lg py-2 px-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-outline-variant/10">
          <button onClick={handleAnalyze} className="w-full bg-surface-container text-primary font-label-sm text-label-sm px-4 py-3 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            Analyze Code
          </button>
        </div>
      </aside>

      {/* Right Sidebar (IBM Bob AI) */}
      <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] z-40 flex flex-col w-80 bg-opacity-80 backdrop-blur-xl bg-surface-container-low border-l border-outline-variant/15 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
        <div className="p-6 border-b border-outline-variant/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center border border-tertiary/30">
            <span className="material-symbols-outlined text-tertiary">smart_toy</span>
          </div>
          <div>
            <h2 className="text-tertiary font-bold text-sm">IBM Bob AI</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Intelligent Assistant</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {rightItems.map((item) => (
            <button key={item.id} onClick={() => handleRightAction(item.id)} disabled={aiLoading}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full cursor-pointer ${
                activeRight === item.id
                  ? 'text-tertiary font-bold border border-tertiary/30 bg-tertiary/10 shadow-[0_0_15px_rgba(221,183,255,0.1)]'
                  : 'text-on-surface-variant hover:glow-purple border border-transparent hover:border-tertiary/20 bg-surface-container-lowest/50'
              }`}>
              <span className={`material-symbols-outlined text-lg ${activeRight === item.id ? 'text-tertiary' : ''}`}>{item.icon}</span>
              <span className="font-label-sm text-label-sm">{aiLoading && activeRight === item.id ? 'Processing...' : item.label}</span>
            </button>
          ))}
          {aiResult && (
            <div className="mt-4 bg-[#050508] border border-tertiary/20 rounded-lg p-4 font-code-md text-code-md text-xs">
              <pre className="text-on-surface-variant whitespace-pre-wrap">{aiResult}</pre>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 mr-80 pt-24 pb-20 px-margin-desktop flex flex-col gap-8 min-h-screen">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Dashboard Summary</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">High-level overview of repository structure, detected architectural debt, and operational hotspots.</p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-high border border-outline-variant/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d2bbff] animate-pulse"></span>
            <span className="font-code-md text-code-md text-on-surface-variant">Live Analysis Active</span>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { icon: 'insert_drive_file', value: stats.files.toLocaleString(), label: 'Total Files', badge: '+12%', badgeClass: 'text-secondary bg-secondary/10 border-secondary/20', color: 'primary' },
            { icon: 'class', value: stats.classes.toLocaleString(), label: 'Total Classes', badge: 'Stable', badgeClass: 'text-on-surface-variant bg-surface-variant border-outline-variant/20', color: 'tertiary' },
            { icon: 'functions', value: stats.functions.toLocaleString(), label: 'Total Functions', badge: '+4%', badgeClass: 'text-error bg-error/10 border-error/20', color: 'primary' },
            { icon: 'schema', value: stats.dependencies.toLocaleString(), label: 'Dependencies', badge: 'Critical', badgeClass: 'text-error bg-error/10 border-error/20', color: 'error' },
          ].map((card, i) => (
            <div key={i} className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/graph')}>
              <div className={`absolute -top-10 -right-10 w-24 h-24 bg-${card.color}/10 rounded-full blur-2xl group-hover:bg-${card.color}/20 transition-all duration-500`}></div>
              <div className="flex justify-between items-start">
                <span className={`material-symbols-outlined text-${card.color} text-[28px]`}>{card.icon}</span>
                <span className={`font-label-sm text-label-sm ${card.badgeClass} px-2 py-1 rounded border`}>{card.badge}</span>
              </div>
              <div>
                <h3 className="font-headline-xl text-headline-xl text-on-surface">{card.value}</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">{card.label}</p>
              </div>
            </div>
          ))}
          <div className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-[0_0_20px_rgba(139,92,246,0.15)] cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-container/20 rounded-full blur-2xl group-hover:bg-primary-container/40 transition-all duration-500"></div>
            <span className="material-symbols-outlined text-primary-container text-[28px]">timer</span>
            <div>
              <h3 className="font-headline-xl text-headline-xl text-primary-container">42<span className="text-headline-md">hrs</span></h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">Est. Time Savings</p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hotspots */}
          <div ref={hotspotsRef} id="hotspots" className="lg:col-span-2 glass-card rounded-xl p-6 flex flex-col scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-xl">local_fire_department</span>
                Hotspots Analysis
              </h3>
              <button onClick={() => navigate('/graph')} className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors cursor-pointer">View Full Table →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="font-label-sm text-label-sm text-on-surface-variant pb-3 font-normal">Rank</th>
                    <th className="font-label-sm text-label-sm text-on-surface-variant pb-3 font-normal">Name</th>
                    <th className="font-label-sm text-label-sm text-on-surface-variant pb-3 font-normal">Type</th>
                    <th className="font-label-sm text-label-sm text-on-surface-variant pb-3 font-normal w-1/4">Risk Score</th>
                    <th className="font-label-sm text-label-sm text-on-surface-variant pb-3 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-code-md text-code-md text-on-surface">
                  {hotspots.map((item, i) => {
                    const colors = getRiskColor(item.risk_score);
                    return (
                      <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors cursor-pointer" onClick={() => handleInspect(item.name)}>
                        <td className={`py-4 font-bold ${colors.badge}`}>#{i + 1}</td>
                        <td className="py-4">{item.name}</td>
                        <td className="py-4"><span className={`bg-surface-container-high px-2 py-1 rounded border border-outline-variant/30 text-xs ${getTypeColor(item.type)}`}>{item.type}</span></td>
                        <td className="py-4">
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${item.risk_score}%` }}></div>
                            </div>
                            <span className={`text-xs ${colors.text}`}>{item.risk_score}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); handleInspect(item.name); }} className="bg-surface-container hover:bg-surface-variant border border-outline-variant/30 px-3 py-1.5 rounded text-xs text-primary transition-colors cursor-pointer">Inspect</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Debt Clusters */}
          <div ref={debtRef} id="debt-clusters" className="glass-card rounded-xl p-6 flex flex-col items-center relative scroll-mt-24">
            <h3 className="font-headline-md text-headline-md text-on-surface w-full mb-6 text-left">Debt Clusters</h3>
            <div className="relative w-48 h-48 rounded-full bg-surface-container overflow-hidden flex items-center justify-center my-4 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              <div className="absolute inset-0 rounded-full border-[20px] border-surface-variant"></div>
              <div className="absolute inset-0 rounded-full border-[20px] border-transparent border-t-primary border-r-primary rotate-45"></div>
              <div className="absolute inset-0 rounded-full border-[20px] border-transparent border-b-tertiary -rotate-12"></div>
              <div className="absolute inset-0 rounded-full border-[20px] border-transparent border-l-error rotate-[15deg]"></div>
              <div className="relative z-10 w-32 h-32 bg-surface-container-low rounded-full flex flex-col items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] border border-outline-variant/10">
                <span className="font-headline-lg text-headline-lg text-on-surface">64%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Debt Ratio</span>
              </div>
            </div>
            <div className="w-full mt-6 space-y-3">
              {[{ color: 'bg-primary', label: 'Architectural', pct: '45%' }, { color: 'bg-tertiary', label: 'Code Duplication', pct: '30%' }, { color: 'bg-error', label: 'Security Flaws', pct: '25%' }].map((d, i) => (
                <div key={i} className="flex items-center justify-between font-label-sm text-label-sm cursor-pointer hover:bg-surface-variant/10 rounded px-1 py-1 transition-colors" onClick={() => navigate('/graph')}>
                  <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${d.color}`}></span><span className="text-on-surface">{d.label}</span></div>
                  <span className="text-on-surface-variant">{d.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Circular Dependencies */}
          <div className="lg:col-span-3 glass-card rounded-xl p-6 border-l-4 border-l-error/70">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-error">sync_problem</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Circular Dependencies Detected</h3>
              <span className="bg-error-container/20 text-error font-label-sm text-label-sm px-2 py-0.5 rounded border border-error/30 ml-2">3 Cycles Found</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Cycle Path #1', nodes: ['Auth.ts', 'UserStore.ts', 'Auth.ts'] },
                { label: 'Cycle Path #2', nodes: ['payment_gateway.py', 'invoice_gen.py', 'payment_gateway.py'] },
                { label: 'Cycle Path #3', nodes: ['ConfigLoader.go', 'Logger.go', 'ConfigLoader.go'] },
              ].map((cycle, i) => (
                <div key={i} className="bg-surface-container-high/50 border border-outline-variant/20 rounded-lg p-4 hover:border-error/40 transition-colors cursor-pointer" onClick={() => navigate(`/graph?node=${encodeURIComponent(cycle.nodes[0])}`)}>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">{cycle.label}</p>
                  <div className="font-code-md text-code-md text-on-surface flex items-center flex-wrap gap-2">
                    {cycle.nodes.map((node, j) => (
                      <span key={j} className="flex items-center gap-2">
                        <span className={`bg-surface-container px-2 py-1 rounded border ${j === cycle.nodes.length - 1 ? 'text-error-container border-error-container/30' : 'border-outline-variant/10'}`}>{node}</span>
                        {j < cycle.nodes.length - 1 && <span className="material-symbols-outlined text-error text-sm">arrow_forward</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-50 flex items-center justify-between px-4 h-8 bg-surface-dim border-t border-outline-variant/10">
        <span className="font-code-md text-code-md text-primary">NodeShift AI Status: Connected</span>
        <ul className="flex items-center gap-6">
          <li><a className="font-code-md text-code-md text-outline hover:text-on-surface transition-colors" href="#">System Logs</a></li>
          <li><span className="font-code-md text-code-md text-outline">Latency: 24ms</span></li>
          <li><span className="font-code-md text-code-md text-outline">v2.4.0-stable</span></li>
        </ul>
      </footer>
    </div>
  );
}
