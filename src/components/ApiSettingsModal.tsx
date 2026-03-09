import React, { useState, useEffect } from 'react';
import { useApiConfig, ApiConfig } from '../hooks/useApiConfig';
import { PROVIDERS, ApiProvider } from '../services/providerConfig';
import { callAiApi } from '../services/apiAdapter';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useApiConfig();
  const [localConfig, setLocalConfig] = useState<ApiConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'warning' | 'idle', message: string, latency?: number }>({ type: 'idle', message: '' });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setTestStatus({ type: 'idle', message: '' });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleProviderChange = (providerId: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setLocalConfig({
        ...localConfig,
        provider: providerId,
        baseUrl: provider.url,
        model: provider.model
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus({ type: 'idle', message: 'Testing connection...' });
    const start = Date.now();

    try {
      const response = await callAiApi(localConfig, "Reply with: OK");
      const latency = Date.now() - start;

      if (response.text.toUpperCase().includes('OK')) {
        setTestStatus({ type: 'success', message: `Connected — Model responded successfully`, latency });
      } else if (response.text) {
        setTestStatus({ type: 'warning', message: `Warning — Connected but response was unexpected: ${response.text.substring(0, 20)}...`, latency });
      } else {
        setTestStatus({ type: 'warning', message: `Warning — Connected but response was empty`, latency });
      }
    } catch (error: any) {
      setTestStatus({ type: 'error', message: `Failed — ${error.message || 'Invalid API key or model name'}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const selectedProvider = PROVIDERS.find(p => p.id === localConfig.provider);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-carbon-base w-full max-w-md rounded-3xl border border-tension-line shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        
        {/* Header */}
        <div className="p-6 border-b border-tension-line flex items-center justify-between bg-carbon-weave">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔑</span>
            <h2 className="text-sm font-black text-text-main uppercase tracking-[0.2em] font-mono">API Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-dim hover:text-text-main">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
          
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest font-mono">Provider</label>
            <select 
              value={localConfig.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full bg-carbon-weave border border-tension-line rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent outline-none transition-colors appearance-none font-mono"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest font-mono">Model Name (optional)</label>
            <input 
              type="text"
              value={localConfig.model}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              placeholder="e.g. gemini-2.0-flash / gpt-4o"
              className="w-full bg-carbon-weave border border-tension-line rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent outline-none transition-colors font-mono"
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest font-mono">API Key</label>
              {selectedProvider?.hint && (
                <span className="text-[9px] text-accent/60 font-mono italic">{selectedProvider.hint}</span>
              )}
            </div>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"}
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder="Enter your API key"
                className="w-full bg-carbon-weave border border-tension-line rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent outline-none transition-colors font-mono pr-12"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-dim hover:text-accent transition-colors"
              >
                {showKey ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-widest font-mono">Base URL</label>
            <input 
              type="text"
              value={localConfig.baseUrl}
              onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="w-full bg-carbon-weave border border-tension-line rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent outline-none transition-colors font-mono"
            />
          </div>

          {/* Status Display */}
          {testStatus.type !== 'idle' && (
            <div className={`p-3 rounded-xl border text-[10px] font-mono flex items-center gap-3 animate-fade-in ${
              testStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
              testStatus.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
              'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${testStatus.type === 'success' ? 'bg-emerald-500' : testStatus.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
              <div className="flex-grow">
                {testStatus.message}
                {testStatus.latency && <span className="ml-2 opacity-60">({testStatus.latency}ms)</span>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-carbon-weave border-t border-tension-line flex gap-3">
          <button 
            onClick={handleTestConnection}
            disabled={isTesting || (!localConfig.apiKey && localConfig.provider !== 'ollama')}
            className="flex-1 py-3 bg-carbon-base border border-tension-line rounded-xl text-[10px] font-black uppercase tracking-widest text-text-main hover:border-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-accent text-carbon-base rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow-accent hover:scale-[1.02] transition-all"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;
