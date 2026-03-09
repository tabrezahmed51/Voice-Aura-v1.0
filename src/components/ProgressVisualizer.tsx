
import React from 'react';

interface ProgressVisualizerProps {
  isActive: boolean;
  label: string;
  description: string;
  progress: number;
  timeRemaining: number | null;
}

const ProgressVisualizer: React.FC<ProgressVisualizerProps> = ({ isActive, label, description, progress, timeRemaining }) => {
  if (!isActive && progress === 0) return null;

  return (
    <div className="w-full bg-carbon-base p-4 rounded-lg my-4 animate-fade-in shadow-lg border border-tension-line">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-text-main font-sans">{label}</h4>
        <span className="text-sm font-bold text-accent font-mono">{Math.round(progress)}%</span>
      </div>
       <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-text-dim font-mono">{description}</p>
        {timeRemaining !== null && (
            <p className="text-xs text-text-dim font-mono">Est. Time: {timeRemaining.toFixed(1)}s</p>
        )}
      </div>
      <div className="w-full bg-carbon-weave rounded-full h-2.5 shadow-inner">
        <div 
          className="bg-accent h-2.5 rounded-full transition-all duration-300 ease-linear shadow-[0_0_10px_var(--accent-dim)]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressVisualizer;
