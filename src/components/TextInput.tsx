import React from 'react';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  isTextArea?: boolean;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, className = '', error, isTextArea, rows, ...props }) => {
  const baseStyles = `w-full bg-carbon-base border rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:shadow-glow-accent transition-all placeholder:text-text-dim/30 ${error ? 'border-danger focus:border-danger' : 'border-tension-line/30 focus:border-accent'}`;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label htmlFor={props.id} className={`text-[10px] uppercase tracking-wider font-mono ${error ? 'text-danger' : 'text-text-dim'}`}>
          {label}
        </label>
      )}
      {isTextArea ? (
        <textarea 
          className={`${baseStyles} ${className}`}
          rows={rows || 3}
          onChange={props.onChange as any}
          {...(props as any)}
        />
      ) : (
        <input 
          className={`${baseStyles} ${className}`}
          onChange={props.onChange as any}
          {...props}
        />
      )}
      {error && <p className="text-[10px] text-danger font-mono">{error}</p>}
    </div>
  );
};

export default TextInput;
