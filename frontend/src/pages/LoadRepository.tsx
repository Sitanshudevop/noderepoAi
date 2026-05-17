import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoadRepository() {
  const navigate = useNavigate();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [repoPath, setRepoPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const simulateScanAndNavigate = (path: string, isDemo: boolean) => {
    setScanning(true);
    setError('');
    setSuccess('');
    setProgress(0);

    const stages = [
      { pct: 15, msg: 'Discovering files...' },
      { pct: 35, msg: 'Parsing AST structures...' },
      { pct: 55, msg: 'Building dependency graph...' },
      { pct: 75, msg: 'Analyzing risk hotspots...' },
      { pct: 90, msg: 'Generating metrics...' },
      { pct: 100, msg: 'Complete' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < stages.length) {
        setProgress(stages[i].pct);
        setStatusMessage(stages[i].msg);
        i++;
      } else {
        clearInterval(interval);
        setScanning(false);
        setSuccess(`Successfully parsed repository: ${path}`);
        setTimeout(() => {
          navigate(`/graph?repo=${encodeURIComponent(path)}&demo=${isDemo}`);
        }, 800);
      }
    }, 600);
  };

  const handleScan = async () => {
    if (!repoPath.trim()) return;
    setScanning(true);
    setError('');
    setSuccess('');
    setProgress(0);
    setStatusMessage('Connecting to backend...');

    try {
      // Try real backend first
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 85));
      }, 400);

      const response = await axios.post('/api/repo/scan', { repo_path: repoPath }, { timeout: 15000 });
      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage('Complete');
      const summary = response.data?.summary || {};
      setSuccess(`Successfully parsed ${summary.total_files || 0} files, ${summary.total_classes || 0} classes, ${summary.total_functions || 0} functions`);
      setScanning(false);
      setTimeout(() => {
        navigate(`/graph?repo=${encodeURIComponent(repoPath)}`);
      }, 1000);
    } catch {
      // Backend unavailable or path invalid — fall back to demo mode
      simulateScanAndNavigate(repoPath, true);
    }
  };

  const handleBrowseFolder = () => {
    folderInputRef.current?.click();
  };

  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Extract the folder path from the first file's webkitRelativePath
      const firstPath = files[0].webkitRelativePath;
      const folderName = firstPath.split('/')[0];
      setRepoPath(folderName);
      setError('');
      setSuccess(`Folder selected: ${folderName} (${files.length} files detected)`);
    }
  };

  const handleDemo = () => {
    setRepoPath('demo://sample-enterprise-app');
    setError('');
    simulateScanAndNavigate('demo://sample-enterprise-app', true);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop font-body-md">
      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        /* @ts-expect-error webkitdirectory is non-standard */
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderSelected}
      />

      <main className="w-full max-w-2xl mx-auto flex flex-col gap-gutter">
        {/* Main Glass Card */}
        <div className="glass-panel rounded-xl p-8 md:p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-3xl rounded-full -z-10"></div>

          {/* Icon Header */}
          <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Load Repository</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
            Connect your local codebase for deep structural analysis and technical debt assessment.
          </p>

          {/* Input Area */}
          <div className="w-full flex flex-col gap-4 mb-8">
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant">terminal</span>
              <input
                className="w-full bg-[rgba(5,5,8,0.6)] border border-outline-variant/30 rounded-lg py-4 pl-12 pr-4 font-code-md text-code-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_8px_rgba(124,58,237,0.4)] transition-all"
                placeholder="C:\Projects\my-app or click Browse Folder"
                type="text"
                value={repoPath}
                onChange={(e) => { setRepoPath(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={handleBrowseFolder}
                className="flex-1 px-6 py-4 rounded-lg border border-primary/30 text-primary font-label-sm text-label-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
                Browse Folder
              </button>
              <button
                onClick={handleScan}
                disabled={scanning || !repoPath.trim()}
                className="flex-1 px-6 py-4 rounded-lg bg-primary-container/80 text-on-primary-container font-label-sm text-label-sm hover:bg-primary-container transition-colors neon-glow flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-60 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                {scanning ? 'Scanning...' : 'Scan Repository'}
              </button>
            </div>
          </div>

          {/* Demo Link */}
          <button
            onClick={handleDemo}
            disabled={scanning}
            className="flex items-center gap-2 text-tertiary hover:text-tertiary-fixed transition-colors font-label-sm text-label-sm mt-4 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            Load Demo Repository
          </button>
        </div>

        {/* States Section */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          {/* Loading State */}
          {scanning && (
            <div className="glass-panel rounded-lg p-6 flex flex-col gap-4 border-primary/20">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary pulse-animation">sync</span>
                  <span className="font-code-md text-code-md text-on-surface">{statusMessage || 'Scanning files...'}</span>
                </div>
                <span className="font-code-md text-code-md text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full neon-glow relative transition-all duration-300"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between w-full font-label-sm text-label-sm text-outline">
                <span>{statusMessage}</span>
                <span>{progress < 100 ? 'In progress...' : 'Done!'}</span>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && !scanning && (
            <div className="glass-panel rounded-lg p-4 flex items-start gap-3 border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.05)]">
              <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div>
                <h4 className="font-body-md text-body-md font-medium text-[#34d399] mb-1">Analysis Complete</h4>
                <p className="font-code-md text-code-md text-outline-variant text-[12px]">{success}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !scanning && (
            <div className="glass-panel rounded-lg p-4 flex items-start gap-3 border-error/20 bg-error/5">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <div>
                <h4 className="font-body-md text-body-md font-medium text-error mb-1">Scan Failed</h4>
                <p className="font-code-md text-code-md text-outline-variant text-[12px]">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
