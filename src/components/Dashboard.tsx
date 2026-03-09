import React from 'react';
import { DashboardMetrics } from '../types';

interface DashboardProps {
  metrics: DashboardMetrics;
}

const StatCard = ({ label, value, subtext, colorClass, borderClass }: any) => (
    <div className={`tension-panel rounded-xl p-4 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-text-dim">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><rect width="24" height="24"/></svg>
        </div>
        <h4 className="text-[10px] uppercase tracking-widest text-accent/70 font-mono mb-1">{label}</h4>
        <div className={`text-2xl font-bold ${colorClass || 'text-text-main'} font-mono neon-text`}>{value}</div>
        {subtext && <div className="text-[9px] text-text-dim mt-2 font-mono">{subtext}</div>}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-tension-line/30 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight font-sans neon-text">System Dashboard</h2>
                <p className="text-xs text-accent font-mono mt-1 neon-text">REAL-TIME TELEMETRY & CONFIGURATION</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-accent/70 bg-carbon-base/50 px-2 py-1 rounded border border-tension-line/30">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_5px_var(--success)]"></span>
                SOCKET SECURE
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                label="Neural Compute" 
                value={`${(metrics.totalTokensUsed / 1000).toFixed(1)}k`} 
                subtext="TOKENS CONSUMED" 
                colorClass="text-accent"
            />
            <StatCard 
                label="Storage Matrix" 
                value={metrics.totalFiles} 
                subtext={`${(metrics.storageUsedBytes / 1024 / 1024).toFixed(2)} MB ALLOCATED`} 
                colorClass="text-text-main"
            />
            <StatCard 
                label="Voice Synthesis" 
                value={`${(metrics.totalVoiceGenerationSeconds / 60).toFixed(1)}m`} 
                subtext="TOTAL GENERATION TIME" 
                colorClass="text-accent"
            />
            <StatCard 
                label="API Latency" 
                value={`${metrics.apiLatencyMs}ms`} 
                subtext="AVG RESPONSE TIME" 
                colorClass={metrics.apiLatencyMs > 500 ? 'text-yellow-400' : 'text-success'}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-4">
                <div className="tension-panel rounded-xl overflow-hidden p-5 flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-wider font-mono neon-text">Audio I/O Nexus</h3>
                    <p className="text-xs text-text-dim text-center mb-4 font-mono">Centralized audio controls are managed in Settings &gt; Audio I/O Configuration.</p>
                </div>
            </div>

            <div className="lg:col-span-1 tension-panel rounded-xl overflow-hidden flex flex-col">
                <div className="bg-carbon-base/30 border-b border-tension-line/30 p-3 backdrop-blur-md">
                    <h3 className="text-xs font-bold text-accent/70 uppercase tracking-wider font-mono">Provider Status</h3>
                </div>
                <div className="p-0 flex-grow overflow-y-auto custom-scrollbar bg-black/20">
                    <table className="w-full text-left text-[10px] font-mono">
                        <thead className="bg-carbon-weave/20 text-text-dim">
                            <tr>
                                <th className="p-3 font-normal">PROVIDER</th>
                                <th className="p-3 font-normal text-right">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tension-line/10">
                            <tr>
                                <td className="p-3 text-text-main">Google Gemini</td>
                                <td className="p-3 text-right text-success shadow-glow-green">ONLINE</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;