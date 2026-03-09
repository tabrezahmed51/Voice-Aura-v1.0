
import React, { useState, useEffect } from 'react';
import { Preset } from '../types';
import TextInput from './TextInput';
import Selector from './Selector';
import { LANGUAGES, VOICES, MUSICAL_KEYS } from '../constants';

const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const LoadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

interface PresetManagerProps {
  presets: Preset[];
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  disabled: boolean;
  allowSave?: boolean;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onSave, onLoad, onDelete, disabled, allowSave = true }) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [selectedPresetDetails, setSelectedPresetDetails] = useState<Preset | null>(null);

  useEffect(() => {
    const trimmedName = newPresetName.trim();
    if (!trimmedName) {
        setNameError(undefined);
        return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 30) {
        setNameError('Name must be 2-30 characters.');
    } else if (!/^[a-zA-Z0-9 _-]+$/.test(trimmedName)) {
        setNameError('Invalid characters in name.');
    } else if (presets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        setNameError('A preset with this name already exists.');
    } else {
        setNameError(undefined);
    }
  }, [newPresetName, presets]);

  useEffect(() => {
    setSelectedPresetDetails(presets.find(p => p.name === selectedPreset) || null);
  }, [selectedPreset, presets]);


  const handleSaveClick = () => {
    onSave(newPresetName.trim());
    setNewPresetName('');
  };

  const handleLoadClick = () => {
    if (selectedPreset) onLoad(selectedPreset);
  };

  const handleDeleteClick = () => {
    if (selectedPreset) {
      if (window.confirm(`Are you sure you want to delete the preset "${selectedPreset}"? This action cannot be undone.`)) {
        onDelete(selectedPreset);
        setSelectedPreset('');
      }
    }
  };
  
  const getLanguageLabel = (value?: string) => LANGUAGES.find(l => l.value === value)?.label || value || 'N/A';
  const getVoiceLabel = (value?: string) => VOICES.find(v => v.value === value)?.label || value || 'N/A';
  const getMusicalKeyLabel = (value?: string) => MUSICAL_KEYS.find(k => k.value === value)?.label || value || 'N/A';


  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 text-text-main font-sans">Preset Manager</h3>
      <div className={`grid grid-cols-1 ${allowSave ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-3`}>
        {/* Save Section */}
        {allowSave && (
            <div className="flex flex-col gap-2 border border-accent-dim bg-accent-dim/10 p-3 rounded-lg shadow-lg">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider font-mono border-b border-accent-dim pb-1 mb-0.5">Save Current Settings</h4>
                <div className="flex flex-col gap-2">
                    <TextInput id="preset-name" label="Preset Name" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="My Custom Preset" disabled={disabled} error={nameError} maxLength={30} />
                    <button onClick={handleSaveClick} disabled={disabled || !newPresetName.trim() || !!nameError} className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dim disabled:bg-carbon-base disabled:cursor-not-allowed text-carbon-base font-bold py-2 px-3 rounded-lg text-xs transition-colors shadow-lg shadow-accent-dim font-mono" title="Save Preset">
                        <SaveIcon /><span>SAVE PRESET</span>
                    </button>
                </div>
            </div>
        )}

        {/* Load/Delete Section */}
        <div className="flex flex-col gap-2 border border-tension-line bg-carbon-base p-3 rounded-lg shadow-lg">
             <h4 className="text-xs font-bold text-text-dim uppercase tracking-wider font-mono border-b border-tension-line pb-1 mb-0.5">Manage Existing Presets</h4>
             {presets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-dim text-xs italic py-3 bg-carbon-weave/20 rounded-lg border border-dashed border-tension-line font-mono">
                    <p>No presets saved yet.</p>
                </div>
             ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col space-y-1 w-full">
                        <label htmlFor="preset-selector" className="text-[10px] sm:text-xs font-mono font-medium text-text-dim">Select Preset</label>
                        <select id="preset-selector" value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)} disabled={disabled} className="w-full bg-carbon-weave border border-tension-line text-text-main text-xs sm:text-sm rounded-lg p-2 font-mono focus:ring-accent focus:border-accent transition-colors disabled:opacity-50 shadow-inner">
                            <option value="">Select a preset...</option>
                            {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    {selectedPresetDetails && (
                      <div className="p-2 bg-carbon-weave rounded-lg text-xs text-text-dim border border-tension-line shadow-inner font-mono">
                        <p className="font-bold text-text-main mb-1">Details ({selectedPresetDetails.type.replace('-', ' ')}):</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          {selectedPresetDetails.type === 'mimic' && (
                            <>
                              <span>Mode:</span> <span className="text-accent capitalize">{selectedPresetDetails.mimicMode || 'Repeat'}</span>
                              <span>Voice:</span> <span className="text-accent">{getVoiceLabel(selectedPresetDetails.voice)}</span>
                              <span>Pitch:</span> <span className="text-accent">{selectedPresetDetails.mimicPitch || 0}</span>
                              <span>Rate:</span> <span className="text-accent">{selectedPresetDetails.mimicSpeakingRate || 1}x</span>
                              <span>Input Lang:</span> <span className="text-accent">{getLanguageLabel(selectedPresetDetails.inputLanguage)}</span>
                            </>
                          )}
                          {selectedPresetDetails.type === 'speech-studio' && (
                            <>
                              <span>TTS Language:</span> <span className="text-accent">{getLanguageLabel(selectedPresetDetails.ttsLanguage)}</span>
                              <span>TTS Voice:</span> <span className="text-accent">{getVoiceLabel(selectedPresetDetails.ttsVoice)}</span>
                              <span>TTS Mode:</span> <span className="text-accent capitalize">{selectedPresetDetails.ttsMode}</span>
                              {selectedPresetDetails.ttsPitch !== undefined && <span>Pitch:</span>} <span className="text-accent">{selectedPresetDetails.ttsPitch}</span>
                              {selectedPresetDetails.ttsSpeakingRate !== undefined && <span>Rate:</span>} <span className="text-accent">{selectedPresetDetails.ttsSpeakingRate}x</span>
                              {selectedPresetDetails.useSsml !== undefined && <span>SSML:</span>} <span className="text-accent">{selectedPresetDetails.useSsml ? 'Yes' : 'No'}</span>
                              {selectedPresetDetails.ttsText && <span>Text Length:</span>} <span className="text-accent">{selectedPresetDetails.ttsText?.length} chars</span>
                            </>
                          )}
                          {selectedPresetDetails.type === 'autotune' && (
                            <>
                              <span>Enabled:</span> <span className="text-accent">{selectedPresetDetails.autotuneEnabled ? 'Yes' : 'No'}</span>
                              <span>Key:</span> <span className="text-accent">{getMusicalKeyLabel(selectedPresetDetails.autotuneKey)}</span>
                              <span>Amount:</span> <span className="text-accent">{selectedPresetDetails.autotuneAmount}%</span>
                            </>
                          )}
                          {selectedPresetDetails.type === 'play-voices' && (
                            <>
                              <span>Source:</span> <span className="text-accent capitalize">{selectedPresetDetails.playVoicesVoiceSource?.replace('prebuilt', 'AI Pre-built')}</span>
                              {selectedPresetDetails.playVoicesSelectedVoice && <span>Base Voice:</span>} <span className="text-accent">{getVoiceLabel(selectedPresetDetails.playVoicesSelectedVoice)}</span>
                              {selectedPresetDetails.playVoicesPrompt && <span>Prompt Length:</span>} <span className="text-accent">{selectedPresetDetails.playVoicesPrompt?.length} chars</span>
                            </>
                          )}
                          {selectedPresetDetails.type === 'live-translation' && (
                            <>
                              <span>Source:</span> <span className="text-accent">{getLanguageLabel(selectedPresetDetails.translationSourceLang)}</span>
                              <span>Target:</span> <span className="text-accent">{getLanguageLabel(selectedPresetDetails.translationTargetLang)}</span>
                              <span>Model:</span> <span className="text-accent">{selectedPresetDetails.translationUseVenice ? 'Venice AI' : 'Gemini'}</span>
                              <span>Voice:</span> <span className="text-accent">{selectedPresetDetails.translationTtsVoice || 'Zephyr'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                        <button onClick={handleLoadClick} disabled={disabled || !selectedPreset} className="flex-grow flex items-center justify-center space-x-2 bg-carbon-weave hover:bg-tension-line disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-semibold py-2 px-3 rounded-lg text-xs transition-colors border border-tension-line font-mono" title="Load Preset">
                            <LoadIcon /><span>LOAD</span>
                        </button>
                        <button onClick={handleDeleteClick} disabled={disabled || !selectedPreset} className="flex items-center justify-center bg-danger/40 hover:bg-danger border border-danger/50 disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-semibold p-2 rounded-lg text-xs transition-colors font-mono" title="Delete Preset">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default PresetManager;
