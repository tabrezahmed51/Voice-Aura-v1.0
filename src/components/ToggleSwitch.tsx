import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  id, 
  label, 
  checked, 
  onChange,
  disabled = false 
}) => {
  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
      {label && <label htmlFor={id} className="text-[10px] uppercase tracking-wider font-mono text-text-dim cursor-pointer">{label}</label>}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
          checked ? 'bg-accent shadow-glow-accent' : 'bg-carbon-weave border border-white/10'
        }`}
      >
        <div 
          className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${
            checked ? 'left-6 bg-carbon-base' : 'left-1 bg-text-dim'
          }`} 
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
