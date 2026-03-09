
import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import Selector from './Selector';
import { AsrConfig, NemotronChunkSize } from '../types';
import { NEMOTRON_CHUNK_OPTIONS } from '../constants';

interface MoltBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  asrConfig?: AsrConfig;
  onAsrConfigChange?: (config: AsrConfig) => void;
}

const BotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;

const MoltBotModal: React.FC<MoltBotModalProps> = ({ isOpen, onClose, isEnabled, onToggleEnabled, asrConfig, onAsrConfigChange }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState({
      autoCorrect: true,
      sentimentAnalysis: true,
      predictiveResponse: false,
      noiseGate: true
  });

  useEffect(() => {
      if (isEnabled && isOpen) {
          const interval = setInterval(() => {
              const actions = [
                  "Scanning audio buffer...",
                  "Optimizing spectral coherence...",
                  "Reducing background noise floor...",
                  "Analyzing sentiment vectors...",
                  "Predicting next user intent...",
                  "Syncing with Neural Nexus...",
                  "Cache-aware streaming active..."
              ];
              const randomAction = actions[Math.floor(Math.random() * actions.length)];
              setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${randomAction}`, ...prev].slice(0, 10));
          }, 1500);
          return () => clearInterval(interval);
      }
  }, [isEnabled, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-bg w-full max-w-lg rounded-xl border border-accent/50 shadow-[0_0_50px_var(--accent-dim)] overflow-hidden flex flex-col relative bg-carbon-base/90">
        
        {/* Header */}
        <div className="p-4 border-b border-accent/20 flex justify-between items-center bg-carbon-base">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isEnabled ? 'bg-accent text-carbon-base shadow-[0_0_15px_var(--accent)]' : 'bg-carbon-weave text-text-dim'}`}>
                 <BotIcon />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-text-main font-sans tracking-tight">MOLTBOT AUTOMATION</h2>
                 <p className="text-[9px] font-mono text-text-dim uppercase tracking-[0.2em]">Autonomous Agent v9.0</p>
             </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text-main p-2">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Master Toggle */}
            <div className="flex items-center justify-between bg-carbon-weave p-4 rounded-xl border border-tension-line">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main">Master Switch</span>
                    <span className="text-[10px] text-text-dim font-mono">Enable full autonomous control</span>
                </div>
                <ToggleSwitch 
                    id="moltbot-master" 
                    label={isEnabled ? "ONLINE" : "OFFLINE"} 
                    checked={isEnabled} 
                    onChange={onToggleEnabled} 
                />
            </div>

            {/* Nemotron ASR Configuration */}
            {asrConfig && onAsrConfigChange && (
                <div className="bg-black/30 border border-tension-line rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <div className="w-2 h-2 bg-[#76b900] rounded-full shadow-[0_0_8px_#76b900]"></div>
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">NVIDIA Nemotron ASR</h3>
                    </div>
                    
                    <Selector 
                        id="moltbot-chunk"
                        label="Chunk Size (Streaming Latency)"
                        value={asrConfig.chunkSize}
                        options={NEMOTRON_CHUNK_OPTIONS}
                        onChange={(val) => onAsrConfigChange({...asrConfig, chunkSize: val as NemotronChunkSize})}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-carbon-weave p-2 rounded-lg border border-white/5">
                            <ToggleSwitch 
                                id="moltbot-pnc"
                                label="Auto PnC"
                                checked={asrConfig.enablePnC}
                                onChange={(v) => onAsrConfigChange({...asrConfig, enablePnC: v})}
                            />
                            <p className="text-[8px] text-text-dim mt-1">Punctuation & Capitalization</p>
                        </div>
                        <div className="bg-carbon-weave p-2 rounded-lg border border-white/5">
                            <ToggleSwitch 
                                id="moltbot-itn"
                                label="Auto ITN"
                                checked={asrConfig.enableITN}
                                onChange={(v) => onAsrConfigChange({...asrConfig, enableITN: v})}
                            />
                            <p className="text-[8px] text-text-dim mt-1">Inverse Text Normalization</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Config Grid */}
            <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ${isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {Object.entries(config).map(([key, val]) => (
                    <div key={key} className="bg-carbon-base border border-tension-line p-3 rounded-lg flex items-center justify-between">
                        <span className="text-[10px] text-text-dim uppercase font-mono">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className={`w-3 h-3 rounded-full border ${val ? 'bg-accent border-accent' : 'bg-transparent border-text-dim'}`}></div>
                    </div>
                ))}
            </div>

            {/* Live Log */}
            <div className="bg-black/40 border border-tension-line rounded-xl p-4 font-mono text-xs h-40 overflow-y-auto custom-scrollbar relative">
                <div className="flex items-center gap-2 mb-2 text-text-dim uppercase tracking-widest text-[9px] sticky top-0 bg-transparent backdrop-blur-sm pb-1 border-b border-white/5">
                    <ActivityIcon /> Live Heuristics
                </div>
                <div className="space-y-1">
                    {isEnabled ? logs.map((log, i) => (
                        <div key={i} className="text-accent/80 truncate">{log}</div>
                    )) : (
                        <div className="text-text-dim/30 italic text-center mt-10">Automation Offline</div>
                    )}
                </div>
            </div>

        </div>
        
        {/* Footer */}
        <div className="p-3 bg-carbon-base border-t border-tension-line flex justify-end">
            <button onClick={onClose} className="px-6 py-2 rounded-lg bg-carbon-weave hover:bg-tension-line text-text-main text-xs font-bold font-mono transition-colors">
                CLOSE CONSOLE
            </button>
        </div>
      </div>
    </div>
  );
};

export default MoltBotModal;
