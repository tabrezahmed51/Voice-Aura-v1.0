
import React from 'react';
import { SoundEffect } from '../types';
import { SOUND_EFFECTS } from '../constants';
import Selector from './Selector';
import FileUpload from './FileUpload';

interface SoundEffectManagerProps {
    selectedEffect: string;
    onSelectEffect: (effectName: string) => void;
    customEffects: SoundEffect[];
    onUploadEffect: (file: File) => void;
    onDeleteEffect: (effectName: string) => void;
    disabled: boolean;
}

const SoundEffectManager: React.FC<SoundEffectManagerProps> = ({
    selectedEffect, onSelectEffect, customEffects, onUploadEffect, onDeleteEffect, disabled
}) => {
    return (
        <div className="tension-panel rounded-2xl bg-carbon-base/50 space-y-4">
            <h3 className="text-xs font-bold text-text-dim uppercase tracking-[0.2em] mb-4 font-mono">Vocal Environment</h3>
            
            <div className="grid grid-cols-2 gap-2">
                {SOUND_EFFECTS.map(ef => (
                    <button
                        key={ef.value}
                        onClick={() => onSelectEffect(ef.value)}
                        disabled={disabled}
                        className={`py-3 px-2 rounded-xl text-[10px] font-mono border transition-all ${selectedEffect === ef.value ? 'bg-accent text-carbon-base border-accent shadow-[0_0_10px_var(--accent-dim)]' : 'bg-carbon-weave text-text-dim border-tension-line hover:bg-tension-line'}`}
                    >
                        {ef.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="pt-4 border-t border-tension-line">
                <FileUpload
                    id="custom-ir"
                    label="Custom Impulse (.wav)"
                    onChange={e => e.target.files?.[0] && onUploadEffect(e.target.files[0])}
                    disabled={disabled}
                    accept=".wav"
                    error={null}
                />
            </div>

            {customEffects.length > 0 && (
                <div className="space-y-2 mt-4">
                    {customEffects.map(eff => (
                        <div key={eff.name} className="flex justify-between items-center bg-carbon-weave p-2 rounded-lg text-[9px] font-mono text-text-dim border border-tension-line">
                            <span>{eff.name}</span>
                            <button onClick={() => onDeleteEffect(eff.name)} className="text-danger hover:underline uppercase">Discard</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SoundEffectManager;
