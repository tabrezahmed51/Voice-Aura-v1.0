
import React, { useState, useEffect, useCallback } from 'react';
import { AudioInputConfig, AudioOutputConfig } from '../types';
import Selector from './Selector';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';

interface AudioControlHubProps {
  inputConfig: AudioInputConfig;
  onInputConfigChange: (config: AudioInputConfig) => void;
  outputConfig: AudioOutputConfig;
  onOutputConfigChange: (config: AudioOutputConfig) => void;
  isAppBusy: boolean;
}

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>;
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);


const AudioControlHub: React.FC<AudioControlHubProps> = ({ 
  inputConfig, 
  onInputConfigChange, 
  outputConfig, 
  onOutputConfigChange,
  isAppBusy 
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [inputDevices, setInputDevices] = useState<{value: string, label: string}[]>([]);
  const [outputDevices, setOutputDevices] = useState<{value: string, label: string}[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  const [testToneActive, setTestToneActive] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionError(false);

        const mediaDevices: MediaDevices = navigator.mediaDevices;
        const devices = await mediaDevices.enumerateDevices();
        
        const inputs = devices
          .filter(d => d.kind === 'audioinput')
          .map(d => ({ 
              value: d.deviceId, 
              label: d.label || `Microphone ${d.deviceId.slice(0,5)}...` 
          }));
        
        const outputs = devices
          .filter(d => d.kind === 'audiooutput')
          .map(d => ({ 
              value: d.deviceId, 
              label: d.label || `Speaker ${d.deviceId.slice(0,5)}...` 
          }));

        setInputDevices(inputs.length > 0 ? inputs : [{value: 'default', label: 'Default Microphone'}]);
        
        if (outputs.length > 0) {
            setOutputDevices(outputs);
        } else {
            setOutputDevices([{value: 'default', label: 'Default System Output'}]);
        }

      } catch (err) {
        console.error("Error fetching audio devices", err);
        setPermissionError(true);
      }
    };

    fetchDevices();
    const mediaDevices: MediaDevices = navigator.mediaDevices;
    const handleDeviceChange = () => fetchDevices();
    mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  }, []);

  const handleInputUpdate = (field: keyof AudioInputConfig, value: any) => {
    onInputConfigChange({ ...inputConfig, [field]: value });
  };

  const handleOutputUpdate = (field: keyof AudioOutputConfig, value: any) => {
    onOutputConfigChange({ ...outputConfig, [field]: value });
  };

  const playTestTone = async () => {
      if (testToneActive) return;
      setTestToneActive(true);
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Attempt to route audio to selected device
      if (outputConfig.deviceId && outputConfig.deviceId !== 'default') {
          try {
              // @ts-ignore
              if (typeof ctx.setSinkId === 'function') {
                  // @ts-ignore
                  await ctx.setSinkId(outputConfig.deviceId);
              // @ts-ignore
              } else if (typeof ctx.destination.setSinkId === 'function') {
                  // @ts-ignore
                  await ctx.destination.setSinkId(outputConfig.deviceId);
              } else {
                  console.warn("Audio output routing not supported in this browser.");
              }
          } catch(e) { 
              console.warn("Sink ID routing failed", e); 
          }
      }

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(outputConfig.masterVolume, ctx.currentTime + 0.05);
      
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.type = 'sine';
      
      osc.start();
      
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
      
      osc.onended = () => { 
          ctx.close(); 
          setTestToneActive(false); 
      };
  };

  return (
    <div className="bg-bg rounded-xl border border-tension-line shadow-xl overflow-hidden w-full h-full flex flex-col animate-fade-in">
      <div className="flex bg-carbon-base border-b border-tension-line shrink-0">
        <button 
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-mono transition-colors ${activeTab === 'input' ? 'bg-bg text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-main'}`}
        >
          <MicIcon /> INPUT
        </button>
        <button 
          onClick={() => setActiveTab('output')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-mono transition-colors ${activeTab === 'output' ? 'bg-bg text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-main'}`}
        >
          <SpeakerIcon /> OUTPUT
        </button>
      </div>

      <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
        {permissionError && (
            <div className="bg-danger/10 border border-danger/30 p-3 rounded-lg mb-4 text-[10px] text-danger font-mono uppercase font-bold tracking-widest text-center animate-pulse shadow-[0_0_10px_var(--danger)]">
                Microphone permission required to list devices.
            </div>
        )}

        {activeTab === 'input' && (
          <div className="space-y-5 animate-fade-in">
            <Selector
              id="mic-select"
              label="Input Source"
              value={inputConfig.deviceId}
              options={inputDevices}
              onChange={(val) => handleInputUpdate('deviceId', val)}
              disabled={isAppBusy}
            />
            
            <div className="bg-carbon-weave p-3 rounded-lg border border-tension-line space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-accent mb-1 border-b border-white/5 pb-2">
                    <SettingsIcon /> <span className="text-xs font-bold uppercase font-mono">Digital Signal Processing (DSP)</span>
                </div>
                
                <ToggleSwitch 
                    id="echo-cancel" 
                    label="Echo Cancellation" 
                    checked={inputConfig.echoCancellation} 
                    onChange={(v) => handleInputUpdate('echoCancellation', v)}
                    disabled={isAppBusy}
                />
                <ToggleSwitch 
                    id="noise-suppress" 
                    label="Noise Suppression" 
                    checked={inputConfig.noiseSuppression} 
                    onChange={(v) => handleInputUpdate('noiseSuppression', v)}
                    disabled={isAppBusy}
                />
                <ToggleSwitch 
                    id="auto-gain" 
                    label="Auto Gain Control" 
                    checked={inputConfig.autoGainControl} 
                    onChange={(v) => handleInputUpdate('autoGainControl', v)}
                    disabled={isAppBusy}
                />
            </div>

            <div className="px-1 pt-2">
                <Slider 
                    id="input-gain"
                    label="Software Preamp Gain"
                    value={inputConfig.gain}
                    min={0}
                    max={2}
                    step={0.1}
                    onChange={(v) => handleInputUpdate('gain', v)}
                    disabled={isAppBusy}
                    displayValue={`${(inputConfig.gain * 100).toFixed(0)}%`}
                />
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="space-y-5 animate-fade-in">
             <Selector
              id="speaker-select"
              label="Output Destination"
              value={outputConfig.deviceId}
              options={outputDevices}
              onChange={(val) => handleOutputUpdate('deviceId', val)}
              disabled={false}
            />

            <div className="bg-carbon-weave p-4 rounded-lg border border-tension-line shadow-inner flex flex-col gap-4">
                <div className="px-1">
                    <Slider 
                        id="master-volume"
                        label="Master Output Volume"
                        value={outputConfig.masterVolume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(v) => handleOutputUpdate('masterVolume', v)}
                        disabled={false}
                        displayValue={`${(outputConfig.masterVolume * 100).toFixed(0)}%`}
                    />
                </div>
                
                <button 
                    onClick={playTestTone}
                    disabled={testToneActive}
                    className="w-full py-3 bg-carbon-base hover:bg-tension-line text-text-main text-[10px] font-bold uppercase tracking-wider rounded border border-tension-line transition-all flex items-center justify-center gap-3 disabled:opacity-40 font-mono active:scale-95 shadow-lg"
                >
                    {testToneActive ? (
                        <>
                            <span className="w-2 h-2 bg-accent rounded-full animate-ping"></span>
                            COMPUTING SIGNAL...
                        </>
                    ) : (
                        <>
                            <SpeakerIcon /> TEST OUTPUT DEVICE
                        </>
                    )}
                </button>
            </div>
            
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-[10px] text-text-dim italic font-mono text-center leading-relaxed">
                    Note: Audio output selection is experimental and may require browser flags or HTTPS. Default system output is used as fallback.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioControlHub;
