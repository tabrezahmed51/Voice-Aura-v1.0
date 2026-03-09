import React from 'react';
import { useApiConfig } from '../hooks/useApiConfig';
import { PROVIDERS } from '../services/providerConfig';

const ProviderStatusChip: React.FC = () => {
  const { config } = useApiConfig();
  const provider = PROVIDERS.find(p => p.id === config.provider);

  if (!config.apiKey && config.provider !== 'ollama') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">No API Key</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
      <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
        ⚡ {provider?.name || 'Custom'} · {config.model}
      </span>
    </div>
  );
};

export default ProviderStatusChip;
