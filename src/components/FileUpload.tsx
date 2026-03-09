import React, { useRef } from 'react';

interface FileUploadProps {
  id?: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  id,
  accept, 
  onChange, 
  label,
  placeholder = "Click to upload or drag and drop",
  disabled = false,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {label && <label htmlFor={id} className="text-[10px] uppercase tracking-wider font-mono text-text-dim">{label}</label>}
      <div 
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-white/5 transition-colors group ${error ? 'border-danger/50 bg-danger/5' : 'border-tension-line/30'}`}
      >
        <input 
          id={id}
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept} 
          onChange={onChange}
          disabled={disabled}
        />
        <div className={`flex flex-col items-center gap-2 transition-colors ${error ? 'text-danger' : 'text-text-dim group-hover:text-accent'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span className="text-xs font-mono">{error || placeholder}</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
