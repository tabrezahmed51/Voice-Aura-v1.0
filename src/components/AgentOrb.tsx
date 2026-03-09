
import React from 'react';

interface AgentOrbProps {
  status: 'idle' | 'listening' | 'thinking' | 'executing' | 'speaking';
  confidence?: number;
}

const AgentOrb: React.FC<AgentOrbProps> = ({ status, confidence = 0 }) => {
  const getOrbColor = () => {
    switch (status) {
      case 'listening': return 'border-accent shadow-[0_0_50px_var(--accent)] bg-accent/20';
      case 'thinking': return 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.6)] bg-purple-500/20';
      case 'executing': return 'border-success shadow-[0_0_50px_rgba(34,197,94,0.6)] bg-success/20';
      case 'speaking': return 'border-blue-400 shadow-[0_0_60px_rgba(96,165,250,0.8)] bg-blue-400/30';
      default: return 'border-text-dim/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-carbon-base';
    }
  };

  const getInnerAnimation = () => {
    switch (status) {
      case 'listening': return 'animate-ping';
      case 'thinking': return 'animate-[spin_3s_linear_infinite]';
      case 'executing': return 'animate-pulse';
      case 'speaking': return 'animate-bounce';
      default: return '';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 transition-all duration-700">
      {/* Outer Ring */}
      <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 animate-[spin_20s_linear_infinite] opacity-30 ${status === 'idle' ? 'border-text-dim' : 'border-current text-white'}`}></div>
      
      {/* Middle Ring (Metric) */}
      <div className="absolute inset-4 rounded-full border border-white/5 flex items-center justify-center">
         {confidence > 0 && (
             <svg className="w-full h-full -rotate-90 text-accent opacity-50" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="283" strokeDashoffset={283 - (283 * confidence)} style={{ transition: 'all 1s ease' }} />
             </svg>
         )}
      </div>

      {/* Core Orb */}
      <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 backdrop-blur-md flex items-center justify-center transition-all duration-500 ${getOrbColor()}`}>
          <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full opacity-80 blur-md ${getInnerAnimation()}`}></div>
          {status === 'thinking' && (
              <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
          )}
      </div>

      {/* Status Text */}
      <div className="absolute -bottom-16 text-center">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white uppercase">{status}</h2>
          <p className="text-[10px] text-text-dim font-mono tracking-[0.4em] uppercase mt-1">Aura Autonomous Core</p>
      </div>
    </div>
  );
};

export default AgentOrb;
