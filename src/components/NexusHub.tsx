import React, { useState } from 'react';
import { APIProvider, AICapability } from '../types';
import TextInput from './TextInput';
import Selector from './Selector';
import { AI_PROVIDER_OPTIONS } from '../constants';

interface NexusHubProps {
  providers: APIProvider[];
  onAddProvider: (provider: APIProvider) => void;
  onClose: (value?: boolean) => void; 
}

const NexusHub: React.FC<NexusHubProps> = ({ providers, onAddProvider }) => {
  const [newKey, setNewKey] = useState('');
  const [selectedProviderValue, setSelectedProviderValue] = useState<string>('Google');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAddKey = () => {
    if (!newKey.trim()) return;
    setIsVerifying(true);
    
    setTimeout(() => {
      const providerData = AI_PROVIDER_OPTIONS.find(p => p.value === selectedProviderValue);
      
      const mapping: Record<string, AICapability[]> = {
        'Google': ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'],
        'OpenAI': ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'],
        'Anthropic': ['Chat', 'Reasoning', 'Vision', 'Coding'],
        'Microsoft': ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'],
        'AWS': ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'],
        'ElevenLabs': ['TTS'],
        'OpenRouter': ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'],
        'Groq': ['Chat', 'Reasoning', 'Coding'],
        'DeepSeek': ['Chat', 'Coding'],
      };

      const newProvider: APIProvider = {
        id: `PROV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: providerData?.label || 'Custom Logic Engine',
        provider: selectedProviderValue as any,
        key: newKey,
        capabilities: mapping[selectedProviderValue] || ['Chat'],
        balance: {
          total: 5000000,
          used: 0,
          currency: 'Compute Tokens',
          renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()
        },
        status: 'Active'
      };

      onAddProvider(newProvider);
      setNewKey('');
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <div className="tension-panel flex flex-col h-full rounded-xl">
        <div className="p-5 border-b border-tension-line/30 bg-carbon-base/80 backdrop-blur-md flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-accent-dim shadow-glow-accent flex items-center justify-center text-carbon-base font-black text-lg border border-text-main/10">N</div>
             <div>
                <h2 className="text-xl font-black text-text-main tracking-tight leading-none mb-1 font-sans neon-text">Nexus Integration Hub</h2>
                <p className="text-[10px] text-accent font-mono uppercase tracking-[0.2em] neon-text">Quantum Model Gateway v4.2</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden min-h-0">
          <div className="w-full md:w-5/12 p-6 border-r border-tension-line/30 bg-carbon-base/50 flex flex-col overflow-y-auto custom-scrollbar">
             <div className="space-y-8">
                <div>
                   <h3 className="text-xs font-black text-accent mb-4 uppercase tracking-[0.1em] flex items-center gap-3 font-mono neon-text">
                      <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent)]"></span>
                      Key Provisioning
                   </h3>
                   <div className="space-y-5">
                       <Selector 
                          id="nexus-prov-select" 
                          label="Computation Network" 
                          value={selectedProviderValue} 
                          options={AI_PROVIDER_OPTIONS.map(p => ({ value: p.value, label: p.label }))} 
                          onChange={(val) => setSelectedProviderValue(val as string)} 
                          disabled={isVerifying} 
                       />
                       <TextInput 
                          id="nexus-api-key" 
                          label="Encrypted Authorization Token" 
                          value={newKey} 
                          onChange={(e) => setNewKey(e.target.value)} 
                          placeholder="sk-quantum-..." 
                          disabled={isVerifying} 
                       />
                   </div>
                </div>
                <button 
                   onClick={handleAddKey} 
                   disabled={!newKey || isVerifying}
                   className="w-full py-4 bg-accent hover:bg-accent-dim disabled:opacity-50 text-carbon-base font-black rounded-xl shadow-glow-accent transition-all uppercase tracking-widest text-[10px] border border-text-main/5 active:scale-95 font-mono hover:scale-[1.02]"
                >
                   {isVerifying ? (
                       <span className="flex items-center justify-center gap-3">
                           <svg className="animate-spin h-4 w-4 text-carbon-base" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           SYNCING NODE...
                       </span>
                   ) : 'INITIALIZE SECURE LINK'}
                </button>
             </div>
          </div>

          <div className="w-full md:w-7/12 p-6 bg-bg overflow-y-auto custom-scrollbar flex flex-col min-h-0">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-accent/70 uppercase tracking-[0.2em] font-mono neon-text">Active System Nodes ({providers.length})</h3>
                <span className="text-[9px] bg-success/10 text-success px-3 py-1 rounded-full border border-success/20 font-bold uppercase tracking-tighter shadow-[0_0_10px_var(--success-dim)] font-mono">OPERATIONAL</span>
             </div>
             
             {providers.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-tension-line/50 rounded-2xl text-text-dim font-mono text-[10px] space-y-4 p-10">
                     <div className="w-12 h-12 rounded-full border border-tension-line/50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-tension-line rounded-full animate-ping"></div>
                     </div>
                     <p className="tracking-widest opacity-60">AWAITING EXTERNAL AUTHENTICATION</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 gap-4">
                     {providers.map(p => (
                         <div key={p.id} className="tension-panel p-5 rounded-2xl border border-tension-line/30 hover:border-accent transition-all group relative overflow-hidden shadow-lg hover:shadow-glow-accent">
                             <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-xl bg-carbon-weave flex items-center justify-center text-[10px] font-black text-text-main border border-tension-line/30 shadow-inner group-hover:text-accent group-hover:border-accent transition-all duration-300 font-mono group-hover:shadow-[0_0_10px_var(--accent-dim)]">
                                         {p.provider.substring(0, 2).toUpperCase()}
                                     </div>
                                     <div className="flex flex-col">
                                         <h4 className="font-black text-text-main text-xs leading-none mb-1 font-sans group-hover:text-accent transition-colors neon-text">{p.name}</h4>
                                         <p className="text-[9px] text-text-dim font-mono">{p.key.substring(0, 10)}••••••••</p>
                                     </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-1.5">
                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${p.status === 'Active' ? 'bg-success shadow-success/50' : 'bg-danger shadow-danger/50'}`}></div>
                                    <span className="text-[8px] font-black text-text-dim uppercase tracking-widest font-mono">Node Valid</span>
                                 </div>
                             </div>
                             <div className="flex flex-wrap gap-1.5 mb-5">
                                 {p.capabilities.slice(0, 5).map(cap => (
                                     <span key={cap} className="text-[8px] px-2 py-1 bg-carbon-weave text-text-dim border border-tension-line/30 rounded-lg group-hover:border-accent-dim group-hover:text-accent transition-all duration-300 font-bold uppercase font-mono">{cap}</span>
                                 ))}
                             </div>
                             <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black text-text-dim uppercase tracking-tighter font-mono">
                                    <span>Quota Consumption</span>
                                    <span>{Math.floor((p.balance.used / p.balance.total) * 100)}% Allocated</span>
                                </div>
                                <div className="w-full h-1 bg-carbon-weave rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-accent shadow-[0_0_10px_var(--accent)]" style={{ width: `${(p.balance.used / p.balance.total) * 100}%` }}></div>
                                </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        </div>
      </div>
  );
};

export default NexusHub;