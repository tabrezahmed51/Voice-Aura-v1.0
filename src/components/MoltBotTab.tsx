
import React, { useState, useEffect, useRef } from 'react';
import { AgentState, SystemLog } from '../types';
import ToggleSwitch from './ToggleSwitch';
import TextInput from './TextInput';

interface MoltBotTabProps {
    agentState: AgentState;
    systemLogs: SystemLog[];
    onToggleAutomation: (enabled: boolean) => void;
    isAutomationEnabled: boolean;
    onExecuteCommand: (cmd: string) => void;
}

const TerminalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>;
const CpuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const LightningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

const MoltBotTab: React.FC<MoltBotTabProps> = ({ 
    agentState, systemLogs, onToggleAutomation, isAutomationEnabled, onExecuteCommand
}) => {
    const [commandInput, setCommandInput] = useState('');
    const logContainerRef = useRef<HTMLDivElement>(null);
    
    // Simulate real-time metrics
    const [cpuLoad, setCpuLoad] = useState(12);
    const [memUsage, setMemUsage] = useState(45);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuLoad(prev => Math.min(100, Math.max(5, prev + (Math.random() * 10 - 5))));
            setMemUsage(prev => Math.min(100, Math.max(20, prev + (Math.random() * 6 - 3))));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [agentState.actions]);

    const handleCommandSubmit = () => {
        if (commandInput.trim()) {
            onExecuteCommand(commandInput);
            setCommandInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg gap-6 p-4 overflow-hidden relative animate-fade-in">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-tension-line/30 pb-4 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-carbon-base border border-accent rounded-lg flex items-center justify-center shadow-glow-accent text-accent">
                        <TerminalIcon />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-main font-sans tracking-tight neon-text">MOLTBOT MISSION CONTROL</h2>
                        <p className="text-[10px] text-accent font-mono uppercase tracking-[0.2em] neon-text">Autonomous Neural Interface v9.2</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-accent/70 uppercase tracking-widest font-mono">System Status</span>
                        <span className={`text-xs font-bold font-mono ${isAutomationEnabled ? 'text-success animate-pulse neon-text' : 'text-danger'}`}>
                            {isAutomationEnabled ? 'ONLINE' : 'MANUAL OVERRIDE'}
                        </span>
                    </div>
                    <ToggleSwitch 
                        id="master-auto" 
                        label="" 
                        checked={isAutomationEnabled} 
                        onChange={onToggleAutomation} 
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0 z-10">
                
                {/* Left Column: Metrics & Status */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-48 lg:h-auto shrink-0 border-b lg:border-b-0 border-tension-line/20 pb-4 lg:pb-0">
                    {/* CPU/Mem Card */}
                    <div className="tension-panel rounded-xl p-4">
                        <h3 className="text-xs font-bold text-accent/70 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                            <CpuIcon /> Core Telemetry
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-text-dim">Neural Load</span>
                                    <span className="text-accent neon-text">{cpuLoad.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-1 bg-carbon-weave rounded-full overflow-hidden">
                                    <div className="h-full bg-accent transition-all duration-500 shadow-[0_0_10px_var(--accent)]" style={{width: `${cpuLoad}%`}}></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-text-dim">Context Buffer</span>
                                    <span className="text-purple-400 neon-text">{memUsage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-1 bg-carbon-weave rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-400 transition-all duration-500 shadow-[0_0_10px_#c084fc]" style={{width: `${memUsage}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Protocols */}
                    <div className="tension-panel rounded-xl p-4">
                        <h3 className="text-xs font-bold text-accent/70 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                            <ShieldIcon /> Active Protocols
                        </h3>
                        <div className="space-y-2">
                            {['Heuristic Analysis', 'Auto-Correction', 'Sentiment Guard', 'Latency Optimizer'].map((proto, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-carbon-weave/50 rounded border border-white/5 hover:border-accent/30 transition-colors">
                                    <span className="text-[10px] font-mono text-text-main">{proto}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isAutomationEnabled ? 'bg-success shadow-[0_0_8px_var(--success)]' : 'bg-text-dim'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="tension-panel rounded-xl p-4">
                        <h3 className="text-xs font-bold text-accent/70 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                            <LightningIcon /> Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onExecuteCommand('sys_scan --deep')} className="glass-btn text-[9px] font-bold py-2 px-1 rounded text-text-main uppercase hover:text-accent">Deep Scan</button>
                            <button onClick={() => onExecuteCommand('net_flush_dns')} className="glass-btn text-[9px] font-bold py-2 px-1 rounded text-text-main uppercase hover:text-accent">Flush Cache</button>
                            <button onClick={() => onExecuteCommand('core_optimize')} className="glass-btn text-[9px] font-bold py-2 px-1 rounded text-text-main uppercase hover:text-accent">Optimize</button>
                            <button onClick={() => onExecuteCommand('sec_verify_integrity')} className="glass-btn text-[9px] font-bold py-2 px-1 rounded text-text-main uppercase hover:text-accent">Verify</button>
                        </div>
                    </div>
                </div>

                {/* Center: Live Terminal */}
                <div className="flex-grow tension-panel rounded-xl flex flex-col shadow-2xl relative font-mono text-xs border-accent/30">
                    <div className="bg-carbon-weave/80 p-2 border-b border-tension-line/30 flex justify-between items-center backdrop-blur-md">
                        <span className="text-[10px] text-accent/70 uppercase tracking-widest pl-2 neon-text">&gt;&gt; Terminal Output</span>
                        <div className="flex gap-1.5 pr-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-danger shadow-[0_0_5px_var(--danger)]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_5px_#eab308]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_5px_var(--success)]"></div>
                        </div>
                    </div>
                    
                    <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-1 bg-black/40" ref={logContainerRef}>
                        {agentState.actions.length === 0 && (
                            <div className="text-text-dim opacity-50 italic">System initialized. Awaiting events...</div>
                        )}
                        {agentState.actions.slice().reverse().map((action, idx) => (
                            <div key={action.id} className="flex gap-2 font-mono hover:bg-white/5 p-0.5 rounded border-l-2 border-transparent hover:border-accent pl-2 group transition-all">
                                <span className="text-text-dim opacity-50 shrink-0 select-none group-hover:text-accent/70">[{new Date(action.timestamp).toLocaleTimeString()}]</span>
                                <span className={`font-bold shrink-0 w-16 select-none ${action.module === 'CORE' ? 'text-accent' : action.module === 'NETWORK' ? 'text-blue-400' : 'text-purple-400'} group-hover:neon-text`}>
                                    {action.module}
                                </span>
                                <span className="text-text-main break-all group-hover:text-white">{action.description}</span>
                            </div>
                        ))}
                        {/* Blinking Cursor */}
                        <div className="animate-pulse text-accent mt-2 flex items-center gap-1">
                            <span>_</span>
                        </div>
                    </div>

                    <div className="p-3 bg-carbon-weave/80 border-t border-tension-line/30 flex gap-2 backdrop-blur-md">
                        <span className="text-accent font-bold pt-2 select-none neon-text">&gt;&gt;</span>
                        <div className="flex-grow">
                            <TextInput 
                                id="bot-cmd" 
                                label="" 
                                value={commandInput} 
                                onChange={(e) => setCommandInput(e.target.value)} 
                                placeholder="Execute root command..." 
                                disabled={false} 
                            />
                        </div>
                        <button 
                            onClick={handleCommandSubmit}
                            className="bg-accent hover:bg-accent/80 text-black font-bold px-4 rounded text-xs uppercase tracking-wider transition-all mt-1 shadow-glow-accent hover:scale-105 active:scale-95"
                        >
                            EXEC
                        </button>
                    </div>
                </div>

                {/* Right Column: System Logs */}
                <div className="w-full lg:w-1/4 tension-panel rounded-xl flex flex-col h-48 lg:h-auto shrink-0">
                    <div className="p-3 bg-carbon-weave/80 border-b border-tension-line/30 flex justify-between items-center backdrop-blur-md">
                        <h3 className="text-xs font-bold text-accent/70 uppercase tracking-widest font-mono">System Audit</h3>
                        <span className="text-[9px] bg-black/50 px-2 py-0.5 rounded border border-tension-line/30 text-accent">{systemLogs.length} events</span>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-2 bg-black/20">
                        {systemLogs.map(log => (
                            <div key={log.id} className={`p-2 rounded border text-[10px] font-mono transition-all hover:brightness-110 hover:scale-[1.02] ${log.severity === 'CRITICAL' ? 'bg-danger/10 border-danger/30 text-danger shadow-glow-red' : log.severity === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-carbon-weave/50 border-white/5 text-text-dim'}`}>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold">{log.severity}</span>
                                    <span className="opacity-70">{log.timestamp}</span>
                                </div>
                                <div className="leading-tight mb-1">{log.message}</div>
                                {log.autoFixState !== 'IDLE' && (
                                    <div className="mt-1 text-accent flex items-center gap-1 border-t border-accent/20 pt-1">
                                        <span className={`text-[8px] ${log.autoFixState === 'RESOLVED' ? 'text-success' : 'animate-pulse'}`}>
                                            {log.autoFixState === 'RESOLVED' ? '✓ FIXED' : '⟳ REPAIRING'}
                                        </span>
                                        {log.autoFixState !== 'RESOLVED' && <span className="text-[8px]">{log.fixProgress}%</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                        {systemLogs.length === 0 && (
                            <div className="text-center text-text-dim opacity-50 text-[10px] mt-10">No system anomalies detected.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MoltBotTab;
