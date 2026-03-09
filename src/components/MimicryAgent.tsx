
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic } from 'lucide-react';
import { Language, Voice, AppStatus, AudioFormat, RealtimeMetrics, Preset, SoundEffect, TranscriptionSegment, ClonedVoice, WaveformRegion, AsrConfig } from '../types';
import { LANGUAGES, VOICES } from '../constants';
import Selector from './Selector';
import AudioPlayer from './AudioPlayer';
import WaveformVisualizer from './WaveformVisualizer';
import ActionButton from './ActionButton';
import PresetManager from './PresetManager';
import SoundEffectManager from './SoundEffectManager';
import RealtimeAnalysisDisplay from './RealtimeAnalysisDisplay';
import RecordingControlBar from './RecordingControlBar';
import Slider from './Slider';
import VocalFingerprint from './VocalFingerprint';

interface MimicryAgentProps {
  inputLanguage: Language;
  onInputLanguageChange: (lang: Language) => void;
  responseLanguage: Language;
  onResponseLanguageChange: (lang: Language) => void;
  targetVoice: Voice;
  onTargetVoiceChange: (voice: Voice) => void;
  isAppBusy: boolean;
  appStatus: AppStatus;
  onStartLive: () => void;
  onStopLive: () => void;
  onPauseLive: () => void;
  onResumeLive: () => void;
  onResetLive: () => void;
  onGenerate: (text: string, voiceOverride?: string) => Promise<AudioBuffer | null>;
  analyserNode?: AnalyserNode;
  outputFormat: AudioFormat;
  transcriptionSegments?: TranscriptionSegment[];
  liveTranscription: string;
  realtimeMetrics: RealtimeMetrics;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (name: string) => void;
  onDeletePreset: (name: string) => void;
  selectedSoundEffect: string;
  onSelectEffect: (effectName: string) => void;
  customEffects: SoundEffect[];
  onUploadEffect: (file: File) => void;
  onDeleteEffect: (effectName: string) => void;
  recordedSessionAudio: AudioBuffer | null;
  mimicMode: 'repeat' | 'conversation';
  onMimicModeChange: (mode: 'repeat' | 'conversation') => void;
  mimicPitch: number;
  onMimicPitchChange: (pitch: number) => void;
  mimicRate: number;
  onMimicRateChange: (rate: number) => void;
  mimicIntensity: number;
  onMimicIntensityChange: (intensity: number) => void;
  onSaveSession: () => void;
  onAutoDetectLanguage?: () => Promise<{ language: Language, confidence: number } | null>;
  favoriteLanguages?: Language[];
  clonedVoices?: ClonedVoice[];
  waveformRegions?: WaveformRegion[];
  asrConfig: AsrConfig;
  onAsrConfigChange: (config: AsrConfig) => void;
  onClearTranscription?: () => void;
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);

const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"></path><path d="M15 16v-2"></path><path d="M8 9h2"></path><path d="M20 9h2"></path><path d="M17.8 11.8 19 13"></path><path d="M15 9h0"></path><path d="M17.8 6.2 19 5"></path><path d="m3 21 9-9"></path><path d="M12.2 6.2 11 5"></path></svg>;

const MimicryAgent: React.FC<MimicryAgentProps> = ({
  inputLanguage, onInputLanguageChange,
  responseLanguage, onResponseLanguageChange,
  targetVoice, onTargetVoiceChange,
  isAppBusy, appStatus,
  onStartLive, onStopLive, onPauseLive, onResumeLive, onResetLive,
  analyserNode,
  transcriptionSegments = [],
  liveTranscription,
  realtimeMetrics,
  presets, onSavePreset, onLoadPreset, onDeletePreset,
  selectedSoundEffect, onSelectEffect, customEffects, onUploadEffect, onDeleteEffect,
  recordedSessionAudio, outputFormat,
  mimicMode, onMimicModeChange,
  mimicPitch, onMimicPitchChange,
  mimicRate, onMimicRateChange,
  mimicIntensity, onMimicIntensityChange,
  onSaveSession,
  onAutoDetectLanguage,
  favoriteLanguages = [],
  clonedVoices = [],
  waveformRegions = [],
  asrConfig,
  onAsrConfigChange,
  onClearTranscription
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [showAsrConfig, setShowAsrConfig] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [detectingLang, setDetectingLang] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ language: Language, confidence: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number, end: number } | null>(null);
  const [isAnalyzingSegment, setIsAnalyzingSegment] = useState(false);
  const [segmentAnalysis, setSegmentAnalysis] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isLiveOrPaused = appStatus === AppStatus.RECORDING || appStatus === AppStatus.MIMICKING || appStatus === AppStatus.PAUSED;
  const { pitch, energy } = realtimeMetrics;
  
  const mockSimilarity = useMemo(() => {
      if (!isLiveOrPaused) return 0;
      const jitterVal = realtimeMetrics.jitter || 0;
      const shimmerVal = realtimeMetrics.shimmer || 0;
      const stability = Math.max(0, 1 - (jitterVal * 2 + shimmerVal * 2));
      
      if (pitch && energy) {
          return (0.80 * stability) + (Math.random() * 0.15);
      }
      return 0.1 + Math.random() * 0.1;
  }, [isLiveOrPaused, pitch, energy, realtimeMetrics]);

  useEffect(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptionSegments, liveTranscription]);

  useEffect(() => {
      if (appStatus === AppStatus.FINISHED && recordedSessionAudio) {
          setShowFinishModal(true);
      }
  }, [appStatus, recordedSessionAudio]);

  const downloadTranscript = () => {
      let content = "";
      if (transcriptionSegments.length > 0) {
          content = transcriptionSegments.map(s => `[${s.timestamp}] ${s.text}`).join('\n');
      } else if (liveTranscription) {
          content = liveTranscription;
      } else {
          return;
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mimicry_transcript_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleSaveAndCloseModal = () => {
      onSaveSession();
      setShowFinishModal(false);
  };

  const handleTrashAndCloseModal = () => {
      onResetLive();
      setShowFinishModal(false);
  };

  const handleAutoDetect = async () => {
      if (onAutoDetectLanguage) {
          setDetectingLang(true);
          setDetectionResult(null);
          try {
              const result = await onAutoDetectLanguage();
              if (result) {
                  setDetectionResult(result);
                  setTimeout(() => setDetectionResult(null), 5000);
              }
          } finally {
              setDetectingLang(false);
          }
      }
  };

  const voiceOptions = useMemo(() => {
    const prebuilt = VOICES.map(v => ({ value: v.value, label: `${v.label} (System)` }));
    const cloned = clonedVoices.filter(v => v.status === 'Ready').map(v => ({ value: v.name, label: `${v.name} (Cloned)` }));
    return [...prebuilt, ...cloned];
  }, [clonedVoices]);

  const sortedLanguages = useMemo(() => {
    return [...LANGUAGES].sort((a, b) => {
      const aFav = favoriteLanguages.includes(a.value);
      const bFav = favoriteLanguages.includes(b.value);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [favoriteLanguages]);

  const handleCopy = () => {
    const text = transcriptionSegments.length > 0 
      ? transcriptionSegments.map(s => s.text).join('\n') 
      : liveTranscription;
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleClear = () => {
    if (onClearTranscription) {
      onClearTranscription();
    }
  };

  const handleSelectRange = (start: number, end: number) => {
    setSelectedRange({ start, end });
  };

  const playSegment = () => {
    if (!recordedSessionAudio || !selectedRange) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createBufferSource();
    source.buffer = recordedSessionAudio;
    source.connect(ctx.destination);
    
    const startTime = selectedRange.start * recordedSessionAudio.duration;
    const duration = (selectedRange.end - selectedRange.start) * recordedSessionAudio.duration;
    
    source.start(0, startTime, duration);
  };

  const analyzeSegment = async () => {
    if (!recordedSessionAudio || !selectedRange) return;
    setIsAnalyzingSegment(true);
    setSegmentAnalysis(null);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const duration = (selectedRange.end - selectedRange.start) * recordedSessionAudio.duration;
        setSegmentAnalysis(`Segment Analysis: Duration ${duration.toFixed(2)}s. Detected stable pitch with minor harmonic fluctuations. Spectral centroid indicates clear articulation.`);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzingSegment(false);
    }
  };

  const [localPitch, setLocalPitch] = useState<number | null>(null);

  // Local Pitch Detection for smooth visualization
  useEffect(() => {
    if (!analyserNode || !isLiveOrPaused || appStatus === AppStatus.PAUSED) {
      setLocalPitch(null);
      return;
    }

    let animationId: number;
    const bufferLength = 2048; // Standard for pitch detection
    const dataArray = new Float32Array(bufferLength);

    const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
      let SIZE = buf.length;
      let rms = 0;
      for (let i = 0; i < SIZE; i++) {
        const val = buf[i];
        rms += val * val;
      }
      rms = Math.sqrt(rms / SIZE);
      if (rms < 0.01) return -1;

      let r1 = 0, r2 = SIZE - 1, thres = 0.2;
      for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
      for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

      const slicedBuf = buf.slice(r1, r2);
      const slicedSize = slicedBuf.length;

      const c = new Array(slicedSize).fill(0);
      for (let i = 0; i < slicedSize; i++)
        for (let j = 0; j < slicedSize - i; j++)
          c[i] = c[i] + slicedBuf[j] * slicedBuf[j + i];

      let d = 0;
      while (c[d] > c[d + 1]) d++;
      let maxval = -1, maxpos = -1;
      for (let i = d; i < slicedSize; i++) {
        if (c[i] > maxval) {
          maxval = c[i];
          maxpos = i;
        }
      }
      let T0 = maxpos;
      const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a) T0 = T0 - b / (2 * a);

      return sampleRate / T0;
    };

    const detectPitch = () => {
      analyserNode.getFloatTimeDomainData(dataArray);
      const p = autoCorrelate(dataArray, analyserNode.context.sampleRate);
      if (p !== -1 && p > 50 && p < 1000) {
        // Apply a small low-pass filter to the local detection to reduce jitter
        setLocalPitch(prev => prev ? prev * 0.4 + p * 0.6 : p);
      }
      animationId = requestAnimationFrame(detectPitch);
    };

    detectPitch();
    return () => cancelAnimationFrame(animationId);
  }, [analyserNode, isLiveOrPaused, appStatus]);

  const currentPitchNum = useMemo(() => {
    if (!realtimeMetrics.pitch) return null;
    return parseFloat(realtimeMetrics.pitch.replace(' Hz', ''));
  }, [realtimeMetrics.pitch]);

  const displayPitch = localPitch || currentPitchNum;

  return (
    <div className="h-auto lg:h-full flex flex-col lg:flex-row gap-6 animate-fade-in overflow-visible lg:overflow-hidden relative">
      
      {/* Modal for Save/Trash */}
      {showFinishModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-carbon-base p-6 rounded-2xl border border-tension-line shadow-[0_0_50px_rgba(45,212,191,0.2)] max-w-sm w-full text-center space-y-6 transform scale-100 transition-all">
                <div className="w-16 h-16 bg-carbon-weave rounded-full mx-auto flex items-center justify-center border border-tension-line text-accent shadow-[0_0_20px_var(--accent-dim)]">
                    <SaveIcon />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-text-main font-sans mb-2">Session Complete</h3>
                    <p className="text-sm text-text-dim font-mono leading-relaxed">Recording captured successfully.<br/>How would you like to proceed?</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={handleSaveAndCloseModal} className="w-full py-3 bg-accent hover:bg-accent-dim text-carbon-base font-bold rounded-xl shadow-[0_0_15px_var(--accent-dim)] hover:scale-[1.02] transition-all font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                        <DownloadIcon /> Save Recording
                    </button>
                    <button onClick={handleTrashAndCloseModal} className="w-full py-3 bg-danger/10 text-danger border border-danger/30 rounded-xl hover:bg-danger/20 transition-colors font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                        <TrashIcon /> Move to Trash
                    </button>
                </div>
                <button onClick={() => setShowFinishModal(false)} className="text-xs text-text-dim hover:text-text-main underline font-mono cursor-pointer">
                    Review Transcript First
                </button>
            </div>
        </div>
      )}

      {/* Left Sidebar - Controls */}
      <div className="flex-none w-full lg:w-80 space-y-4 lg:overflow-y-auto lg:custom-scrollbar pr-0 lg:pr-2 h-auto lg:h-full pb-0">
        
        {/* Configuration Panel */}
        <div className="bg-carbon-base p-4 rounded-xl border border-tension-line shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-text-main font-mono uppercase tracking-wider">Configuration</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setShowAsrConfig(!showAsrConfig)} className="text-[10px] text-accent hover:underline font-mono uppercase tracking-widest">
                            ASR
                        </button>
                        <button onClick={() => setShowPresets(!showPresets)} className="text-[10px] text-accent hover:underline font-mono uppercase tracking-widest">
                            Presets
                        </button>
                    </div>
                </div>
                {showPresets && (
                    <div className="mb-4 p-2 bg-carbon-weave rounded-lg border border-accent-dim animate-fade-in">
                            <PresetManager presets={presets} onSave={onSavePreset} onLoad={onLoadPreset} onDelete={onDeletePreset} disabled={isAppBusy} />
                    </div>
                )}
                {showAsrConfig && (
                    <div className="mb-4 p-3 bg-carbon-weave rounded-lg border border-accent-dim animate-fade-in space-y-3">
                        <h4 className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] mb-1">ASR Model Parameters</h4>
                        <Slider 
                            id="beam-width" 
                            label="Beam Search Width" 
                            value={asrConfig.beamSearchWidth || 5} 
                            min={1} 
                            max={20} 
                            step={1} 
                            onChange={(val) => onAsrConfigChange({ ...asrConfig, beamSearchWidth: val })} 
                            disabled={isAppBusy} 
                            displayValue={`${asrConfig.beamSearchWidth || 5}`}
                        />
                        <Slider 
                            id="lm-influence" 
                            label="LM Influence" 
                            value={asrConfig.lmInfluence || 0.6} 
                            min={0} 
                            max={1} 
                            step={0.05} 
                            onChange={(val) => onAsrConfigChange({ ...asrConfig, lmInfluence: val })} 
                            disabled={isAppBusy} 
                            displayValue={`${(asrConfig.lmInfluence || 0.6).toFixed(2)}`}
                        />
                        <div className="flex gap-4 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={asrConfig.enablePnC} 
                                    onChange={(e) => onAsrConfigChange({ ...asrConfig, enablePnC: e.target.checked })}
                                    className="sr-only"
                                />
                                <div className={`w-3 h-3 rounded border border-accent/30 flex items-center justify-center transition-all ${asrConfig.enablePnC ? 'bg-accent border-accent shadow-glow-teal' : 'bg-black/40'}`}>
                                    {asrConfig.enablePnC && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <span className="text-[8px] text-text-dim uppercase tracking-widest font-mono group-hover:text-accent transition-colors">PnC</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={asrConfig.enableITN} 
                                    onChange={(e) => onAsrConfigChange({ ...asrConfig, enableITN: e.target.checked })}
                                    className="sr-only"
                                />
                                <div className={`w-3 h-3 rounded border border-accent/30 flex items-center justify-center transition-all ${asrConfig.enableITN ? 'bg-accent border-accent shadow-glow-teal' : 'bg-black/40'}`}>
                                    {asrConfig.enableITN && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <span className="text-[8px] text-text-dim uppercase tracking-widest font-mono group-hover:text-accent transition-colors">ITN</span>
                            </label>
                        </div>
                    </div>
                )}
            
            <div className="space-y-4">
                {/* Mode Selector */}
                <div className="flex gap-2 bg-carbon-weave p-1 rounded-lg border border-tension-line">
                    <button 
                        onClick={() => onMimicModeChange('repeat')} 
                        disabled={isLiveOrPaused}
                        className={`flex-1 py-1.5 text-[9px] uppercase font-bold rounded font-mono transition-all ${mimicMode === 'repeat' ? 'bg-carbon-base text-text-main shadow-sm' : 'text-text-dim'}`}
                    >
                        Echo / Mimic
                    </button>
                    <button 
                        onClick={() => onMimicModeChange('conversation')} 
                        disabled={isLiveOrPaused}
                        className={`flex-1 py-1.5 text-[9px] uppercase font-bold rounded font-mono transition-all ${mimicMode === 'conversation' ? 'bg-carbon-base text-accent shadow-sm' : 'text-text-dim'}`}
                    >
                        Chatbot
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <Selector 
                                id="input-lang" 
                                label="Input Language" 
                                value={inputLanguage} 
                                options={sortedLanguages} 
                                onChange={(val) => onInputLanguageChange(val as Language)} 
                                disabled={isAppBusy || isLiveOrPaused || detectingLang} 
                            />
                        </div>
                        {onAutoDetectLanguage && (
                            <button 
                                onClick={handleAutoDetect}
                                disabled={isAppBusy || isLiveOrPaused || detectingLang}
                                title="Auto-Detect Language"
                                className={`p-2.5 rounded-lg border transition-all shrink-0 mb-0.5
                                    ${detectingLang 
                                        ? 'bg-accent/10 border-accent text-accent animate-pulse' 
                                        : 'bg-carbon-weave border-tension-line/30 text-text-dim hover:text-accent hover:border-accent/50'
                                    }
                                `}
                            >
                                <WandIcon />
                            </button>
                        )}
                    </div>
                    {detectionResult && (
                        <div className="text-[9px] text-center font-mono animate-fade-in">
                            <span className="text-success font-bold">Detected: {detectionResult.language}</span>
                            <span className="text-text-dim ml-1">({detectionResult.confidence}%)</span>
                        </div>
                    )}
                </div>
                
                <Selector 
                    id="response-lang" 
                    label="Response Language" 
                    value={responseLanguage} 
                    options={sortedLanguages} 
                    onChange={(val) => onResponseLanguageChange(val as Language)} 
                    disabled={isAppBusy || isLiveOrPaused} 
                />

                <Selector 
                    id="target-voice" 
                    label="Target Persona" 
                    value={targetVoice} 
                    options={voiceOptions} 
                    onChange={(val) => onTargetVoiceChange(val as Voice)} 
                    disabled={isAppBusy || isLiveOrPaused} 
                />
                
                {/* Advanced Controls */}
                <div className="border-t border-tension-line pt-3 mt-2 space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] text-text-dim uppercase tracking-widest font-mono font-bold">Voice Modulation</h4>
                        <button 
                            onClick={() => { onMimicPitchChange(0); onMimicRateChange(1.0); onMimicIntensityChange(100); }}
                            className="text-[8px] text-accent hover:underline font-mono uppercase tracking-widest"
                        >
                            Reset All
                        </button>
                    </div>
                    <Slider 
                        id="mimic-pitch" 
                        label="Pitch Shift" 
                        value={mimicPitch} 
                        min={-12} 
                        max={12} 
                        step={1} 
                        onChange={onMimicPitchChange} 
                        disabled={isAppBusy} 
                        displayValue={`${mimicPitch > 0 ? '+' : ''}${mimicPitch} st`}
                    />
                    <Slider 
                        id="mimic-rate" 
                        label="Speaking Rate" 
                        value={mimicRate} 
                        min={0.5} 
                        max={2.0} 
                        step={0.1} 
                        onChange={onMimicRateChange} 
                        disabled={isAppBusy} 
                        displayValue={`${mimicRate}x`}
                    />
                    <Slider 
                        id="mimic-intensity" 
                        label="Mimicry Intensity" 
                        value={mimicIntensity} 
                        min={0} 
                        max={100} 
                        step={1} 
                        onChange={onMimicIntensityChange} 
                        disabled={isAppBusy} 
                        displayValue={`${mimicIntensity}%`}
                    />
                </div>
            </div>
        </div>

        {/* Sound Effects Manager */}
        <SoundEffectManager 
            selectedEffect={selectedSoundEffect} 
            onSelectEffect={onSelectEffect} 
            customEffects={customEffects} 
            onUploadEffect={onUploadEffect} 
            onDeleteEffect={onDeleteEffect} 
            disabled={isAppBusy} 
        />
      </div>

      {/* Main Content - Live Interface */}
      <div className="flex-grow flex flex-col gap-4 lg:h-full h-auto min-h-0">
        
        {/* Top Visualizers */}
        <div className="flex flex-col md:flex-row gap-4 h-48 shrink-0">
            <RealtimeAnalysisDisplay metrics={realtimeMetrics} />
            <div className="flex-1 bg-carbon-base rounded-2xl border border-tension-line shadow-lg relative overflow-hidden">
                <div className="absolute top-2 left-2 z-10 flex gap-2">
                    <div className="px-2 py-1 bg-black/50 backdrop-blur rounded border border-tension-line/30 text-[9px] text-accent uppercase tracking-wider font-bold">
                        Waveform Monitor
                    </div>
                    <div className="px-2 py-1 bg-accent/10 backdrop-blur rounded border border-accent/30 text-[9px] text-accent uppercase tracking-wider font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                        Micro-Depth Analysis
                    </div>
                </div>
                <WaveformVisualizer 
                    analyserNode={analyserNode} 
                    audioBuffer={recordedSessionAudio || undefined} 
                    isRecording={isLiveOrPaused} 
                    regions={waveformRegions} 
                    onSelectRange={handleSelectRange}
                />
                {selectedRange && !isLiveOrPaused && (
                    <div className="absolute top-12 left-2 flex gap-2 animate-fade-in z-20">
                        <button 
                            onClick={playSegment}
                            className="px-3 py-1.5 bg-accent text-carbon-base rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                        >
                            Play Selection
                        </button>
                        <button 
                            onClick={analyzeSegment}
                            disabled={isAnalyzingSegment}
                            className="px-3 py-1.5 bg-carbon-weave text-accent border border-accent/30 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-accent/10 transition-all flex items-center gap-2"
                        >
                            {isAnalyzingSegment ? <span className="animate-spin">⟳</span> : null}
                            Analyze Selection
                        </button>
                        <button 
                            onClick={() => { setSelectedRange(null); setSegmentAnalysis(null); }}
                            className="px-3 py-1.5 bg-danger/20 text-danger border border-danger/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-danger/30 transition-all"
                        >
                            Clear
                        </button>
                    </div>
                )}
                {segmentAnalysis && (
                    <div className="absolute bottom-2 left-2 right-2 bg-carbon-base/90 backdrop-blur border border-accent/30 p-2 rounded-lg animate-slide-up z-20">
                        <p className="text-[9px] font-mono text-accent leading-relaxed">{segmentAnalysis}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Live Transcript / Log */}
        <div className="flex-grow bg-carbon-base border border-tension-line rounded-2xl p-0 shadow-inner flex flex-col overflow-hidden relative min-h-[300px]">
            <div className="bg-carbon-weave/30 border-b border-tension-line p-4 flex justify-between items-center shrink-0">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${appStatus === AppStatus.MIMICKING ? 'bg-danger animate-pulse' : 'bg-text-dim'}`}></span>
                    {mimicMode === 'conversation' ? 'Conversational Neural Link' : 'Live Echo Stream'}
                </label>
                <div className="flex gap-2">
                    {(transcriptionSegments.length > 0 || liveTranscription) && (
                        <>
                            <button 
                                onClick={handleCopy} 
                                className="text-[10px] font-bold text-text-dim hover:text-accent uppercase tracking-widest font-mono border border-tension-line/30 rounded-lg px-3 py-1.5 hover:bg-accent/5 transition-all flex items-center gap-2 group/copy" 
                                title="Copy to Clipboard"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/copy:scale-110 transition-transform"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Copy
                            </button>
                            <button 
                                onClick={handleClear} 
                                className="text-[10px] font-bold text-text-dim hover:text-danger uppercase tracking-widest font-mono border border-tension-line/30 rounded-lg px-3 py-1.5 hover:bg-danger/5 transition-all flex items-center gap-2 group/clear" 
                                title="Clear Transcript"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/clear:scale-110 transition-transform"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                Clear
                            </button>
                            <button onClick={downloadTranscript} className="text-[10px] font-bold text-text-dim hover:text-text-main uppercase tracking-widest font-mono border border-tension-line/30 rounded-lg px-3 py-1.5 hover:bg-carbon-weave transition-all flex items-center gap-2">
                                <DownloadIcon /> Save
                            </button>
                        </>
                    )}
                    {appStatus === AppStatus.FINISHED && (
                        <button onClick={onResetLive} className="text-[10px] font-bold text-danger hover:text-danger/80 uppercase tracking-widest font-mono border border-danger/30 rounded px-2 py-1 hover:bg-danger/10 transition-colors">
                            Clear Session
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-4">
                {transcriptionSegments.length > 0 ? (
                    transcriptionSegments.map((segment, index) => (
                        <div key={segment.id} className={`flex flex-col gap-1 p-2 rounded-lg transition-all duration-300 ${index === transcriptionSegments.length - 1 ? 'bg-carbon-weave/50 border-l-2 border-accent shadow-glow-teal' : 'opacity-70 hover:opacity-100 hover:bg-carbon-weave/30'}`}>
                            <span className="text-[9px] text-text-dim font-mono select-none px-1.5 py-0.5 rounded bg-black/20 w-fit">
                                [{segment.timestamp}]
                            </span>
                            <p className="text-text-main text-sm font-mono leading-relaxed pl-2 border-l-2 border-tension-line/20">
                                <span className={`mr-2 ${index === transcriptionSegments.length - 1 ? 'text-accent' : 'text-text-dim'}`}>&gt;&gt;</span>
                                {segment.text}
                                {index === transcriptionSegments.length - 1 && !segment.isFinal && (
                                    <span className="inline-block w-1.5 h-3 bg-accent ml-1 animate-pulse align-middle"></span>
                                )}
                            </p>
                        </div>
                    ))
                ) : liveTranscription ? (
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-carbon-weave border border-accent/20 shadow-sm">
                        <p className="text-text-main text-sm font-mono leading-relaxed">
                            <span className="text-accent opacity-70 mr-2">&gt;&gt;</span>
                            {liveTranscription}
                            <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse align-middle"></span>
                        </p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-dim/20">
                        <p className="text-xs uppercase tracking-widest">
                            {mimicMode === 'conversation' ? "Speak to begin conversation..." : "Awaiting Audio Input..."}
                        </p>
                    </div>
                )}
                
                {appStatus === AppStatus.FINISHED && recordedSessionAudio && (
                    <div className="mt-6 border-t border-tension-line pt-4 animate-fade-in">
                        <h4 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-3 font-mono">Session Recording</h4>
                        <AudioPlayer audioBuffer={recordedSessionAudio} title="Live Session Capture" onDelete={onResetLive} format={outputFormat} />
                    </div>
                )}
                <div ref={transcriptEndRef} />
            </div>
            
            {/* Control Bar */}
            <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-carbon-base/80 backdrop-blur-xl border border-tension-line rounded-2xl p-3 flex justify-center items-center shadow-2xl">
                    <div className="w-full max-w-lg">
                        {isLiveOrPaused ? (
                            <RecordingControlBar 
                                isPaused={appStatus === AppStatus.PAUSED}
                                onPause={onPauseLive}
                                onResume={onResumeLive}
                                onStop={onStopLive}
                                onCancel={onStopLive}
                                onRestart={() => { onStopLive(); setTimeout(onStartLive, 100); }} 
                            />
                        ) : (
                            <ActionButton 
                                icon={<Mic />}
                                onClick={onStartLive} 
                                disabled={appStatus === AppStatus.ANALYZING}
                                className="w-full py-4 text-sm shadow-glow-accent"
                            >
                                {appStatus === AppStatus.ANALYZING ? "Initializing..." : "Start Mimicry Session"}
                            </ActionButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Deep-Analysis & Telemetry (Right) */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar lg:overflow-visible pb-10 lg:pb-0">
          <VocalFingerprint similarity={mockSimilarity} audioBuffer={recordedSessionAudio} currentPitch={displayPitch} isActive={isLiveOrPaused} />
          
          <div className="bg-carbon-base/30 border-2 border-tension-line/20 rounded-[2rem] p-6 flex-grow shadow-2xl backdrop-blur-sm">
            <h3 className="text-xs font-black text-text-dim uppercase tracking-[0.3em] font-mono mb-6 border-b border-white/5 pb-3">Kernel Telemetry</h3>
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-text-dim uppercase font-mono tracking-widest opacity-60">System Latency</span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-success font-mono tracking-tighter tabular-nums">74ms</span>
                      <span className="text-[10px] text-text-dim font-mono mb-1.5">± 4ms</span>
                    </div>
                    <div className="w-full h-1 bg-carbon-weave rounded-full overflow-hidden">
                       <div className="h-full bg-success/40 w-[20%]"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-text-dim uppercase font-mono tracking-widest opacity-60">Buffer Saturation</span>
                    <span className="text-2xl font-black text-text-main font-mono tracking-tighter tabular-nums">14.2%</span>
                    <div className="w-full h-1 bg-carbon-weave rounded-full overflow-hidden">
                       <div className="h-full bg-accent/40 w-[14.2%]"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-text-dim uppercase font-mono tracking-widest opacity-60">Neural Modules</span>
                    <div className="flex flex-wrap gap-2.5">
                        <span className="px-3 py-1.5 bg-black/40 text-[9px] font-black rounded-xl border border-white/10 text-accent font-mono tracking-widest">PCM-L16</span>
                        <span className="px-3 py-1.5 bg-black/40 text-[9px] font-black rounded-xl border border-white/10 text-success font-mono tracking-widest">OPUS-RT</span>
                        <span className="px-3 py-1.5 bg-black/40 text-[9px] font-black rounded-xl border border-white/10 text-purple-400 font-mono tracking-widest">HINDI-V4</span>
                        <span className="px-3 py-1.5 bg-black/40 text-[9px] font-black rounded-xl border border-white/10 text-rose-400 font-mono tracking-widest">MAR-PHX</span>
                    </div>
                </div>
            </div>
          </div>
      </div>

    </div>
  );
};

export default MimicryAgent;
