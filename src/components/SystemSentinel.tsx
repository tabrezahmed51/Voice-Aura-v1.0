
import React, { useState, useEffect } from 'react';
import { SystemLog, ErrorSeverity } from '../types';

interface SystemSentinelProps {
  logs: SystemLog[];
  onResolve: (id: string) => void;
  onClose: () => void; 
}

const SystemSentinel: React.FC<SystemSentinelProps> = ({ logs, onResolve, onClose }) => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  useEffect(() => {
    const activeFix = logs.find(l => l.autoFixState !== 'IDLE' && l.autoFixState !== 'RESOLVED');
    if (activeFix) {
        setSelectedLog(activeFix);
    } else {
        const critical = logs.find(l => l.severity === 'CRITICAL' && !l.resolved);
        if (critical) setSelectedLog(critical);
        else if (logs.length > 0) setSelectedLog(logs[0]); 
    }
  }, [logs]);

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-danger shadow-[0_0_15px_rgba(255,62,62,0.5)]';
      case 'WARNING': return 'text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]';
      case 'INFO': return 'text-accent';
      default: return 'text-text-dim';
    }
  };

  const getSeverityBg = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-danger/30 border-danger/50';
      case 'WARNING': return 'bg-yellow-500/30 border-yellow-500/50';
      case 'INFO': return 'bg-accent-dim border-accent/50';
      default: return 'bg-carbon-base border-tension-line';
    }
  };

  return (
    <div className="w-full max-w-5xl tension-panel rounded-xl flex flex-col lg:flex-row h-[480px] font-mono relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
      <div className="w-full lg:w-1/3 border-r border-tension-line/30 bg-carbon-base/80 backdrop-blur-md z-10 flex flex-col">
        <div className="p-3 border-b border-tension-line/30 flex justify-between items-center bg-carbon-weave/50">
          <h2 className="text-xs font-bold tracking-widest text-accent/70 uppercase font-mono neon-text">System Audit Log</h2>
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5">
               <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-success opacity-75 shadow-[0_0_5px_var(--success)]"></span>
               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
            </span>
            <button onClick={onClose} className="text-text-dim hover:text-accent transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-carbon-weave">&times;</button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1.5 custom-scrollbar bg-black/20">
          {logs.length === 0 ? (
             <div className="text-center text-text-dim mt-8 text-xs font-mono">System Optimal. No anomalies.</div>
          ) : (
            logs.map(log => (
              <div 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className={`p-2 rounded cursor-pointer border transition-all duration-200 hover:bg-carbon-weave/50 ${selectedLog?.id === log.id ? 'bg-carbon-weave/80 border-accent shadow-glow-accent' : 'border-transparent hover:border-accent/20'}`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${getSeverityBg(log.severity)} ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className="text-[9px] text-text-dim">{log.timestamp}</span>
                </div>
                <div className="text-[10px] text-text-main truncate">{log.message}</div>
                {log.autoFixState !== 'IDLE' && log.autoFixState !== 'RESOLVED' && (
                    <div className="mt-1 w-full bg-carbon-base h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-accent animate-pulse shadow-[0_0_5px_var(--accent)]" style={{ width: `${log.fixProgress}%`}}></div>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="w-full lg:w-2/3 bg-carbon-base/90 backdrop-blur-sm z-10 flex flex-col relative items-center justify-center p-6">
        {selectedLog ? (
          <div className="w-full max-w-md aspect-square bg-carbon-base/80 border border-accent-dim rounded-xl relative overflow-hidden shadow-glow-accent flex flex-col">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
             <div className="p-3 border-b border-accent-dim bg-accent-dim/5 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedLog.resolved ? 'bg-success shadow-[0_0_10px_var(--success)]' : 'bg-danger shadow-[0_0_10px_var(--danger)] animate-pulse'}`}></div>
                    <h2 className="text-xs font-bold text-accent uppercase tracking-widest font-mono neon-text">
                        {selectedLog.autoFixState === 'IDLE' ? 'MANUAL INTERVENTION REQUIRED' : `AUTO-PILOT: ${selectedLog.autoFixState}`}
                    </h2>
                </div>
                <span className="text-[10px] font-mono text-text-dim">{selectedLog.id}</span>
             </div>
             <div className="flex-grow relative p-4 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-text-dim uppercase tracking-widest font-mono">Assigned Agent</span>
                        <span className="text-sm font-bold text-text-main shadow-accent-dim drop-shadow-lg font-sans">{selectedLog.assignedAgent || 'System Admin'}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] text-text-dim uppercase tracking-widest font-mono">Integrity</span>
                        <span className="text-sm font-bold text-danger font-sans">{selectedLog.resolved ? '100%' : 'Critical'}</span>
                    </div>
                </div>
                <div className="flex-grow bg-carbon-base border border-tension-line rounded-lg p-2 font-mono text-[9px] text-success overflow-hidden relative opacity-80 shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-success/10 to-transparent h-10 w-full animate-scan pointer-events-none"></div>
                    <p className="opacity-50">import core.system.diagnostic;</p>
                    <p className="opacity-50">analyzing stack trace...</p>
                    <p className="text-danger">{selectedLog.message}</p>
                    {selectedLog.codeSnippet && (
                        <>
                            <p className="mt-2 text-yellow-300">// Vulnerability Detected</p>
                            <p className="text-text-dim">{selectedLog.codeSnippet}</p>
                        </>
                    )}
                    {selectedLog.autoFixState === 'PATCHING' && (
                        <>
                            <p className="mt-2 text-accent">// Applying Heuristic Patch v4.2...</p>
                            <p className="text-accent">rewriting memory block 0x4F...</p>
                        </>
                    )}
                    {selectedLog.autoFixState === 'RESOLVED' && (
                        <p className="mt-2 text-success font-bold">&gt;&gt; SYSTEM RESTORED SUCCESSFULLY.</p>
                    )}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-text-dim uppercase font-mono">
                        <span>Restoration Progress</span>
                        <span>{selectedLog.fixProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-carbon-weave rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full transition-all duration-300 ${selectedLog.resolved ? 'bg-success shadow-[0_0_10px_var(--success)]' : 'bg-accent shadow-[0_0_10px_var(--accent-dim)]'}`} 
                            style={{ width: `${selectedLog.fixProgress}%` }}
                        ></div>
                    </div>
                </div>
             </div>
             {selectedLog.autoFixState === 'IDLE' && !selectedLog.resolved && (
                 <div className="p-3 border-t border-accent-dim bg-accent-dim/5 z-10 text-center">
                     <button onClick={() => onResolve(selectedLog.id)} className="w-full bg-accent hover:bg-accent-dim text-carbon-base font-bold py-2 rounded text-xs uppercase tracking-widest shadow-[0_0_20px_var(--accent-dim)] transition-all font-mono">
                         INITIATE MANUAL REPAIR SEQUENCE
                     </button>
                 </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-dim space-y-4">
             <div className="w-24 h-24 rounded-full border-2 border-dashed border-tension-line animate-[spin_10s_linear_infinite] flex items-center justify-center relative shadow-xl">
                <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_20px_var(--accent)] absolute top-0"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-text-dim font-mono">STANDBY</div>
             </div>
             <p className="text-[10px] uppercase tracking-widest font-bold text-text-dim font-mono">Awaiting System Event</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSentinel;
