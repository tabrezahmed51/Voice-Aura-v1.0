
import React from 'react';
import { RealtimeMetrics } from '../types';

interface RealtimeAnalysisDisplayProps {
  metrics: RealtimeMetrics;
}

const getMetricColor = (val: number) => {
    if (val < 0.02) return 'text-success';
    if (val < 0.05) return 'text-yellow-400';
    return 'text-danger';
};

const RealtimeAnalysisDisplay: React.FC<RealtimeAnalysisDisplayProps> = ({ metrics }) => {
  const { pitch, energy, jitter, shimmer, glottalization } = metrics;

  return (
    <div className="flex-1 bg-bg p-4 rounded-2xl border border-tension-line shadow-lg animate-fade-in flex flex-col justify-center relative overflow-hidden">
      {!pitch && !energy ? (
        <div className="flex flex-col items-center justify-center opacity-30 gap-2">
           <div className="w-6 h-6 border-2 border-dashed border-accent rounded-full animate-spin"></div>
           <p className="text-[7px] font-mono uppercase tracking-[0.3em]">Standby...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-4">
              <div className="flex flex-col">
                  <span className="text-[7px] text-text-dim uppercase font-mono tracking-widest mb-1">Fundamental (F0)</span>
                  <span className="text-base font-black text-accent font-mono leading-none tracking-tighter">{pitch || '--'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[7px] text-text-dim uppercase font-mono tracking-widest mb-1">Spectral Energy</span>
                  <span className="text-base font-black text-success font-mono leading-none tracking-tighter">{energy || '--'}</span>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-[9px] font-mono border-l border-tension-line pl-4">
              <div className="flex flex-col">
                  <span className="text-text-dim text-[7px] uppercase tracking-tighter">Jitter</span>
                  <span className={`font-bold ${getMetricColor(jitter)}`}>{(jitter * 100).toFixed(2)}%</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-text-dim text-[7px] uppercase tracking-tighter">Shimmer</span>
                  <span className={`font-bold ${getMetricColor(shimmer)}`}>{(shimmer * 100).toFixed(2)}%</span>
              </div>
              <div className="flex flex-col col-span-2 pt-2 border-t border-tension-line/50">
                  <span className="text-text-dim text-[7px] uppercase tracking-tighter">Glottalization</span>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="flex-grow h-1 bg-carbon-weave rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${glottalization * 100}%` }}></div>
                      </div>
                      <span className="text-text-main font-bold">{(glottalization * 100).toFixed(0)}%</span>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeAnalysisDisplay;
