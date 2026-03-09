
import React, { useState } from 'react';
import { MUSICAL_KEYS } from '../constants';
import PitchVisualizer from './PitchVisualizer';
import Selector from './Selector';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';
import FileUpload from './FileUpload';
import AudioPlayer from './AudioPlayer';
import TextInput from './TextInput';
import { AudioFormat } from '../types';

interface AutotuneTabProps {
  autotuneEnabled: boolean;
  onAutotuneEnabledChange: (enabled: boolean) => void;
  autotuneKey: string;
  onAutotuneKeyChange: (key: string) => void;
  autotuneAmount: number;
  onAutotuneAmountChange: (amount: number) => void;
  autotuneHumanize: number;
  onAutotuneHumanizeChange: (val: number) => void;
  autotuneVibrato: number;
  onAutotuneVibratoChange: (val: number) => void;
  originalPitch: number | null;
  correctedPitch: number | null;
  isAppBusy: boolean;
  uploadedAudio: AudioBuffer | null;
  onUploadedAudioChange: (buffer: AudioBuffer | null) => void;
  correctedAudio: AudioBuffer | null;
  onCorrectedAudioChange: (buffer: AudioBuffer | null) => void;
  onCorrectPitch: () => void;
  sinkId?: string; 
  onToggleAudioHub: () => void; 
  isAudioHubOpen: boolean;
  onOutputConfigChange?: (deviceId: string) => void; 
}

const DialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="12" x2="12" y2="6"></line></svg>;
const WaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5l3 5 5-10 4 5h3"></path></svg>;
const CompareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l5 5"></path><path d="M4 4l5 5"></path></svg>;

const AutotuneTab: React.FC<AutotuneTabProps> = ({
  autotuneEnabled,
  onAutotuneEnabledChange,
  autotuneKey,
  onAutotuneKeyChange,
  autotuneAmount,
  onAutotuneAmountChange,
  autotuneHumanize,
  onAutotuneHumanizeChange,
  autotuneVibrato,
  onAutotuneVibratoChange,
  originalPitch,
  correctedPitch,
  isAppBusy,
  uploadedAudio,
  onUploadedAudioChange,
  correctedAudio,
  onCorrectedAudioChange,
  onCorrectPitch,
  sinkId
}) => {
  const [isProcessingPitch, setIsProcessingPitch] = useState(false); 
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<AudioFormat>('wav'); 
  const [compareMode, setCompareMode] = useState<'original' | 'corrected'>('corrected');

  const handleFileUploadInternal = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileUploadError(null); 
    
    if (!file) {
      onUploadedAudioChange(null);
      return;
    }

    if (!file.type.startsWith('audio/')) {
        setFileUploadError("Invalid file format. Please upload an audio file (WAV/MP3).");
        onUploadedAudioChange(null);
        event.target.value = '';
        return;
    }

    setIsProcessingPitch(true);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
            try {
                const buffer = await audioContext.decodeAudioData(e.target.result);
                onUploadedAudioChange(buffer);
                onCorrectedAudioChange(null);
                setCompareMode('original');
            } catch (decodeError) {
                console.error("Failed to decode audio file:", decodeError);
                setFileUploadError("Invalid audio file format. Please upload a WAV or MP3.");
                onUploadedAudioChange(null);
            } finally {
                audioContext.close();
                setIsProcessingPitch(false);
            }
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; 
  };


  const handleInternalCorrectPitch = async () => {
      if (!uploadedAudio) return;
      setIsProcessingPitch(true);
      try {
          await onCorrectPitch();
          setCompareMode('corrected');
      } finally {
          setIsProcessingPitch(false);
      }
  };
  
  const handleClearUploaded = () => {
    onUploadedAudioChange(null);
    onCorrectedAudioChange(null);
    setFileUploadError(null);
    const fileInput = document.getElementById('autotune-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
  
  const activeAudio = compareMode === 'corrected' && correctedAudio ? correctedAudio : uploadedAudio;

  return (
    <div className="flex flex-col gap-6 lg:h-full h-auto overflow-y-auto custom-scrollbar"> 
      <div className="flex-none text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-main to-text-dim font-sans">Spectral Pitch Correction</h2>
        <p className="text-xs text-text-dim font-mono mt-1">
          Advanced frequency quantization and real-time correction engine.
        </p>
      </div>

       <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0"> 
            {/* Left Column: Processing Unit */}
            <div className="tension-panel p-6 rounded-xl space-y-6 flex flex-col h-auto lg:h-full lg:overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"></span>
                        <h4 className="font-semibold text-sm uppercase tracking-wide text-text-dim font-mono">Audio Processing</h4>
                    </div>
                </div>
                
                <FileUpload
                    id="autotune-upload"
                    label="Source Audio (WAV/MP3)"
                    onChange={handleFileUploadInternal}
                    disabled={isAppBusy || isProcessingPitch}
                    accept="audio/wav, audio/mpeg"
                    error={fileUploadError}
                />
                 
                 <div className="space-y-6 flex-grow">
                     {/* Source Player */}
                     <div className="bg-carbon-base p-4 rounded-lg border border-tension-line shadow-md relative group">
                         <div className="absolute top-2 right-2 text-xs font-bold text-text-dim uppercase opacity-50 group-hover:opacity-100 transition-opacity font-mono">Original</div>
                         <AudioPlayer 
                            audioBuffer={uploadedAudio} 
                            title="Raw Input" 
                            onDelete={handleClearUploaded} 
                            sinkId={sinkId}
                            format={outputFormat} 
                         />
                     </div>
                     
                     <div className="flex justify-center">
                         <button onClick={handleInternalCorrectPitch} disabled={!uploadedAudio || isAppBusy || isProcessingPitch} className="bg-accent hover:bg-accent-dim disabled:bg-carbon-base text-carbon-base font-bold py-3 px-8 rounded-full text-sm transition-all shadow-lg shadow-accent-dim flex items-center gap-2 transform hover:scale-105 active:scale-95 font-mono">
                            {isProcessingPitch ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-carbon-base" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    PROCESSING...
                                </>
                            ) : (
                                <>
                                    <span>✨</span> APPLY CORRECTION
                                </>
                            )}
                        </button>
                     </div>

                     {/* Corrected Player */}
                     <div className="bg-carbon-base p-4 rounded-lg border border-accent border-l-4 shadow-lg relative group">
                         <div className="absolute top-2 right-2 text-xs font-bold text-accent uppercase opacity-50 group-hover:opacity-100 transition-opacity font-mono">Retuned</div>
                         <AudioPlayer 
                            audioBuffer={correctedAudio} 
                            title="Corrected Output" 
                            onDelete={() => onCorrectedAudioChange(null)} 
                            sinkId={sinkId}
                            format={outputFormat} 
                         />
                     </div>
                 </div>
            </div>
             
             {/* Right Column: Controls & Vis */}
             <div className="flex flex-col gap-6 h-auto lg:h-full overflow-hidden">
                 <div className="tension-panel p-6 rounded-xl space-y-4 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                         <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_blue]"></span>
                         <h4 className="font-semibold text-sm uppercase tracking-wide text-text-dim font-mono">Correction Parameters</h4>
                    </div>
                    
                    <ToggleSwitch
                        id="autotune-enabled"
                        label="Enable Real-time Autotune"
                        checked={autotuneEnabled}
                        onChange={onAutotuneEnabledChange}
                        disabled={isAppBusy}
                    />
                    
                    <div className="grid grid-cols-2 gap-6">
                        <Selector
                        id="autotune-key"
                        label="Key Signature"
                        value={autotuneKey}
                        options={MUSICAL_KEYS}
                        onChange={(val: string) => onAutotuneKeyChange(val)}
                        disabled={isAppBusy || !autotuneEnabled}
                        />
                        <Slider
                        id="autotune-amount"
                        label="Retune Speed"
                        min={0}
                        max={100}
                        step={1}
                        value={autotuneAmount}
                        onChange={onAutotuneAmountChange}
                        disabled={isAppBusy || !autotuneEnabled}
                        displayValue={`${autotuneAmount}%`}
                        />
                    </div>
                    <Selector 
                        id="output-format" 
                        label="Output Format" 
                        value={outputFormat} 
                        options={[{value: 'wav', label: 'WAV'}, {value: 'webm', label: 'WebM'}, {value: 'mp3', label: 'MP3'}]} 
                        onChange={(val) => setOutputFormat(val as AudioFormat)} 
                        disabled={isAppBusy || isProcessingPitch} 
                    />
                 </div>

                 <div className="bg-bg p-4 rounded-xl space-y-3 border border-tension-line shadow-xl flex-grow flex flex-col overflow-hidden min-h-[300px]">
                    <div className="flex justify-between items-center shrink-0">
                        <h4 className="font-semibold text-xs text-text-dim uppercase tracking-widest font-mono">Dynamic Waveform Comparison</h4>
                        <span className="text-[9px] text-text-dim bg-carbon-base px-2 py-1 rounded border border-tension-line">Original (Gray) vs Corrected (Teal)</span>
                    </div>
                    <div className="flex-grow relative w-full h-full">
                        <div className="absolute inset-0">
                            <PitchVisualizer
                              isActive={autotuneEnabled && (uploadedAudio !== null || isAppBusy)} 
                              originalPitch={originalPitch}
                              correctedPitch={correctedPitch}
                              originalBuffer={uploadedAudio}
                              correctedBuffer={correctedAudio}
                              sinkId={sinkId}
                            />
                        </div>
                    </div>
                 </div>
             </div>
       </div>
    </div>
  );
};

export default AutotuneTab;
