import React from 'react';
import { NeuralinkProvider } from '../types';

interface NeuralinkIntegrationProps {
  providers: NeuralinkProvider[];
  onUpdateProvider: (provider: NeuralinkProvider) => void;
}

const NeuralinkIntegration: React.FC<NeuralinkIntegrationProps> = ({ providers, onUpdateProvider }) => {
  const handleToggleConnection = (provider: NeuralinkProvider) => {
    const newStatus = provider.status === 'Connected' ? 'Disconnected' : 'Connected';
    let newSignal = provider.signalStrength;
    let newLatency = provider.latencyMs;

    if (newStatus === 'Connected') {
      newSignal = Math.floor(Math.random() * (95 - 70 + 1)) + 70; // Simulate good signal
      newLatency = Math.floor(Math.random() * (50 - 10 + 1)) + 10; // Simulate low latency
    } else {
      newSignal = 0;
      newLatency = 999;
    }

    onUpdateProvider({
      ...provider,
      status: newStatus,
      signalStrength: newSignal,
      latencyMs: newLatency,
    });
  };

  return (
    <div className="tension-panel flex flex-col h-full rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-tension-line bg-carbon-base flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-accent to-purple-700 shadow-[0_0_10px_var(--accent-dim)] flex items-center justify-center text-carbon-base font-bold text-sm">🧠</div>
        <div>
          <h2 className="text-lg font-bold text-text-main tracking-tight font-sans">Neuralink Gateway</h2>
          <p className="text-[9px] text-text-dim uppercase tracking-widest font-mono">Advanced BCI Protocol - ACTIVE</p>
        </div>
      </div>

      <div className="flex-grow p-5 bg-carbon-base overflow-y-auto custom-scrollbar">
        {providers.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-tension-line rounded-xl bg-carbon-base/10 text-text-dim font-mono">
            <p className="text-xs mb-2">NO BCI DEVICES DETECTED</p>
            <p className="text-[10px]">Simulated connection needed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {providers.map(p => (
              <div key={p.id} className="bg-carbon-weave p-4 rounded-xl border border-tension-line hover:border-accent-dim transition-all group relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-carbon-base flex items-center justify-center text-xs font-bold text-text-dim border border-tension-line font-mono">
                    NL
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main text-sm font-sans">{p.name}</h4>
                    <p className="text-[9px] text-text-dim font-mono">Firmware: {p.firmwareVersion}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs mb-2 font-mono">
                  <span className="text-text-dim">Status:</span>
                  <span className={`font-semibold ${p.status === 'Connected' ? 'text-success' : p.status === 'Error' ? 'text-danger' : 'text-yellow-400'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs mb-2 font-mono">
                  <span className="text-text-dim">Signal:</span>
                  <span className="font-semibold text-text-main">{p.signalStrength}%</span>
                </div>
                <div className="w-full bg-carbon-weave rounded-full h-1 mb-2">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${p.signalStrength}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-xs mb-3 font-mono">
                  <span className="text-text-dim">Latency:</span>
                  <span className="font-semibold text-text-main">{p.latencyMs}ms</span>
                </div>

                <button
                  onClick={() => handleToggleConnection(p)}
                  className={`w-full py-2 rounded-lg text-text-main font-bold text-xs uppercase tracking-wider transition-all shadow-lg font-mono ${
                    p.status === 'Connected'
                      ? 'bg-danger/50 hover:bg-danger shadow-danger/20'
                      : 'bg-success/50 hover:bg-success shadow-success/20'
                  }`}
                >
                  {p.status === 'Connected' ? 'DISCONNECT' : 'CONNECT'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralinkIntegration;