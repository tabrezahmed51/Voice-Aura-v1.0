
import React, { useState, useEffect, useRef } from 'react';
import AgentOrb from './AgentOrb';
import { AgentState } from '../types';

interface AgentCommandCenterProps {
  agentState: AgentState;
  onCommand: (text: string) => void;
  onVoiceInputToggle: () => void;
  isRecording: boolean;
  transcript: string;
  onOpenMoltBot: () => void;
  isMoltBotEnabled: boolean;
}

const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-danger animate-pulse" : "text-text-dim"}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const BotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;

const AgentCommandCenter: React.FC<AgentCommandCenterProps> = ({ 
    agentState, onCommand, onVoiceInputToggle, isRecording, transcript, onOpenMoltBot, isMoltBotEnabled
}) => {
  const [inputValue, setInputValue] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentState.actions]);

  const handleSubmit = () => {
      if (inputValue.trim()) {
          onCommand(inputValue);
          setInputValue('');
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex flex-col h-full bg-bg relative overflow-hidden">
        {/* Background Ambient Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(45,212,191,0.05),transparent_70%)] pointer-events-none"></div>

        {/* Top Bar: Autonomy Status */}
        <div className="flex justify-between items-center p-6 z-10">
            <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${agentState.mode === 'autonomous' ? 'bg-success shadow-[0_0_10px_var(--success)]' : 'bg-yellow-500'}`}></div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-dim">
                    {agentState.mode === 'autonomous' ? 'Full Autonomy Enabled' : 'Manual Override Active'}
                </span>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onOpenMoltBot}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold transition-all ${isMoltBotEnabled ? 'bg-accent text-carbon-base border-accent shadow-[0_0_10px_var(--accent-dim)]' : 'bg-carbon-base text-text-dim border-tension-line hover:border-accent hover:text-accent'}`}
                >
                    <BotIcon />
                    MOLTBOT
                </button>
                <span className="text-[10px] font-mono text-accent border border-accent/20 px-2 py-1 rounded bg-accent/5">v4.5.0-AGENT</span>
            </div>
        </div>

        {/* Central Agent Visualizer */}
        <div className="flex-grow flex flex-col items-center justify-center z-10 min-h-[300px]">
            <AgentOrb status={agentState.status} confidence={agentState.confidence} />
            
            {/* Contextual Message (What the agent is doing) */}
            <div className="mt-12 h-8 text-center px-4">
                {agentState.currentTask && (
                    <p className="text-sm font-mono text-accent animate-pulse tracking-wide">
                        &gt; {agentState.currentTask}...
                    </p>
                )}
                {isRecording && <p className="text-sm font-mono text-text-dim">{transcript || "Listening..."}</p>}
            </div>
        </div>

        {/* Bottom Section: Command & Logs */}
        <div className="z-20 w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
            
            {/* Intelligent Action Log */}
            <div className="h-32 tension-panel rounded-2xl p-4 overflow-y-auto custom-scrollbar shadow-2xl relative">
                <div className="absolute top-2 right-4 text-[9px] font-bold text-accent/50 uppercase tracking-widest neon-text">Neural Logic Stream</div>
                <div className="space-y-2 font-mono text-xs">
                    {agentState.actions.length === 0 && <p className="text-text-dim/30 italic text-center mt-8">System Idle. Awaiting Directive.</p>}
                    {agentState.actions.map(action => (
                        <div key={action.id} className="flex gap-3 items-start animate-fade-in hover:bg-white/5 p-1 rounded transition-colors">
                            <span className="text-text-dim shrink-0 opacity-50">[{new Date(action.timestamp).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}]</span>
                            <span className={`font-bold shrink-0 w-16 ${action.module === 'CORE' ? 'text-accent neon-text' : action.module === 'AUDIO' ? 'text-blue-400' : 'text-purple-400'}`}>{action.module}</span>
                            <span className={`${action.status === 'failed' ? 'text-danger' : action.status === 'active' ? 'text-text-main animate-pulse' : 'text-text-dim'}`}>
                                {action.description}
                            </span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-3 bg-carbon-base border border-tension-line/50 rounded-full p-2 shadow-glow-accent transition-all focus-within:border-accent focus-within:shadow-[0_0_25px_var(--accent-dim)]">
                <button 
                    onClick={onVoiceInputToggle}
                    className={`p-3 rounded-full transition-all duration-300 ${isRecording ? 'bg-danger/20 text-danger scale-110 shadow-glow-red' : 'hover:bg-carbon-weave text-text-dim hover:text-text-main'}`}
                >
                    <MicIcon active={isRecording} />
                </button>
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Command the Agent (e.g., 'Clone my voice and translate to Hindi')" 
                    className="flex-grow bg-transparent text-text-main text-sm font-mono focus:outline-none placeholder-text-dim/40"
                    disabled={agentState.status === 'executing'}
                />
                <button 
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className="p-3 bg-accent hover:bg-accent-dim text-carbon-base rounded-full font-bold transition-all disabled:opacity-50 disabled:bg-carbon-weave disabled:text-text-dim shadow-glow-accent hover:scale-105"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AgentCommandCenter;
