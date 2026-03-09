import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-accent rounded-full animate-pulse shadow-glow-accent"></div>
      <h1 className="text-xl font-bold tracking-widest uppercase font-mono text-text-main neon-text">
        VOICE <span className="text-accent">AURA</span>
      </h1>
    </div>
  );
};

export default Logo;
