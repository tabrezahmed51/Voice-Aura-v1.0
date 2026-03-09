import React from 'react';

interface SliderProps {
  id?: string;
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
  displayValue?: string;
}

const Slider: React.FC<SliderProps> = ({ 
  id,
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  unit = '',
  disabled = false,
  displayValue
}) => {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      {label && (
        <div className="flex justify-between text-[10px] uppercase tracking-wider font-mono text-text-dim">
          <label htmlFor={id}>{label}</label>
          <span className="text-accent">{displayValue || `${value}${unit}`}</span>
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1 bg-carbon-weave rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default Slider;
