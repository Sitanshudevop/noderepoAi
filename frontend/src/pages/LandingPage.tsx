import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md text-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-opacity-80 backdrop-blur-xl bg-surface-container-low border-b border-outline-variant/15 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">NodeShift AI</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => navigate('/graph')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">Graph</button>
          <button onClick={() => navigate('/dashboard')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">Dashboard</button>
          <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">Hotspots</button>
          <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">Debt Clusters</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/load')} className="font-label-sm text-label-sm text-primary hover:bg-primary/10 transition-all duration-300 px-4 py-2 rounded-lg">Load New Repo</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 w-full">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop bg-surface-container-lowest particles-bg pb-20">
          <div className="max-w-4xl w-full text-center z-10 flex flex-col items-center gap-8 mt-12 md:mt-0">
            <h1 className="font-headline-xl text-[64px] md:text-[96px] leading-tight tracking-tighter text-gradient-purple drop-shadow-lg">
              RepoGraph AI
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Visualize. Analyze. Modernize. Powered by IBM Bob.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mt-8 justify-center items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/load')}
                className="btn-filled-glass w-full sm:w-auto px-8 py-4 rounded-xl font-label-sm text-label-sm text-white flex items-center justify-center gap-2"
              >
                Load Repository
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              </button>
              <button
                onClick={() => navigate('/load')}
                className="btn-outlined-glass w-full sm:w-auto px-8 py-4 rounded-xl font-label-sm text-label-sm text-primary flex items-center justify-center gap-2"
              >
                Try Demo
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </button>
            </div>
          </div>
          {/* Floating Pill Badge */}
          <div className="absolute bottom-12 right-margin-mobile md:right-margin-desktop glass-panel rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_0_20px_rgba(139,92,246,0.15)] z-20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#7c3aed]"></div>
            <span className="font-code-md text-code-md text-tertiary">IBM Bob Active</span>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop pb-32 -mt-24 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Card 1 */}
            <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover-neon-glow transition-all duration-300 ease-out hover:-translate-y-2 group cursor-pointer h-full">
              <div className="w-12 h-12 rounded-lg bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Graph Visualization</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Map complex dependencies and architecture across your entire codebase instantly.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover-neon-glow transition-all duration-300 ease-out hover:-translate-y-2 group cursor-pointer h-full">
              <div className="w-12 h-12 rounded-lg bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center group-hover:border-error/50 transition-colors">
                <span className="material-symbols-outlined text-error text-2xl">local_fire_department</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Hotspot Detection</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Identify technical debt clusters and high-risk refactoring zones with precision.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover-neon-glow transition-all duration-300 ease-out hover:-translate-y-2 group cursor-pointer h-full">
              <div className="w-12 h-12 rounded-lg bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center group-hover:border-tertiary/50 transition-colors">
                <span className="material-symbols-outlined text-tertiary text-2xl">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">AI Modernization</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Automate legacy code updates and pattern migrations driven by IBM Bob.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover-neon-glow transition-all duration-300 ease-out hover:-translate-y-2 group cursor-pointer h-full">
              <div className="w-12 h-12 rounded-lg bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center group-hover:border-secondary/50 transition-colors">
                <span className="material-symbols-outlined text-secondary text-2xl">science</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Test Generation</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Synthesize comprehensive test coverage for undocumented or brittle modules.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-50 flex items-center justify-between px-4 h-8 bg-surface-dim border-t border-outline-variant/10">
        <div className="flex items-center gap-4">
          <span className="font-code-md text-code-md text-primary">NodeShift AI Status: Connected</span>
        </div>
        <div className="flex items-center gap-6">
          <a className="font-code-md text-code-md text-outline hover:text-on-surface transition-colors" href="#">System Logs</a>
          <span className="font-code-md text-code-md text-outline">Latency: 24ms</span>
          <span className="font-code-md text-code-md text-outline">v2.4.0-stable</span>
        </div>
      </footer>
    </div>
  );
}
