import React from 'react';
import { AppStatus } from '../types';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  status?: AppStatus;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  status,
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed justify-center";
  
  const variants = {
    primary: "bg-accent text-carbon-base hover:bg-accent-dim hover:text-accent border border-transparent hover:border-accent shadow-glow-accent",
    secondary: "bg-carbon-weave text-text-dim hover:text-text-main border border-white/5 hover:border-white/10",
    danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 shadow-glow-red"
  };

  let content = children;
  if (!content && status !== undefined) {
      if (status === AppStatus.IDLE) content = "Start Mimicry";
      else if (status === AppStatus.RECORDING) content = "Stop Recording";
      else if (status === AppStatus.MIMICKING) content = "Stop Mimicry";
      else content = "Action";
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {content}
    </button>
  );
};

export default ActionButton;
