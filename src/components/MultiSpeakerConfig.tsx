import React from 'react';
import { SpeakerConfig } from '../types';

interface MultiSpeakerConfigProps {
  speakers: SpeakerConfig[];
  onChange: (index: number, field: keyof SpeakerConfig, value: any) => void;
  disabled?: boolean;
  errors?: string[];
}

const MultiSpeakerConfig: React.FC<MultiSpeakerConfigProps> = ({ speakers, onChange, disabled, errors }) => {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <h3 className="text-[10px] uppercase tracking-wider font-mono text-text-dim">Multi-Speaker Config</h3>
      <div className="space-y-2">
        {speakers.map((speaker, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input 
              className="bg-carbon-base border border-tension-line/30 rounded px-2 py-1 text-xs font-mono text-text-main w-1/2"
              value={speaker.name}
              onChange={(e) => onChange(index, 'name', e.target.value)}
              placeholder={`Speaker ${index + 1}`}
            />
             <select 
              className="bg-carbon-base border border-tension-line/30 rounded px-2 py-1 text-xs font-mono text-text-main w-1/2"
              value={speaker.voice}
              onChange={(e) => onChange(index, 'voice', e.target.value)}
            >
              <option value="Kore">Kore</option>
              <option value="Puck">Puck</option>
              <option value="Charon">Charon</option>
              <option value="Fenrir">Fenrir</option>
              <option value="Zephyr">Zephyr</option>
            </select>
          </div>
        ))}
      </div>
      {errors && errors.length > 0 && (
        <div className="text-[10px] text-danger font-mono">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </div>
  );
};

export default MultiSpeakerConfig;
