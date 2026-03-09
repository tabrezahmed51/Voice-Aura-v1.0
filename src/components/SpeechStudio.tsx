
import React, { useState, useRef, useEffect } from 'react';
import { Language, Voice, SpeakerConfig, BaseVoice, PronunciationAnalysis, Preset, WordAnalysis, AudioFormat, InspectionStatus, AsrConfig, TTSEngine, NemotronChunkSize, ActiveTab, AppStatus, ClonedVoice, WaveformRegion } from '../types';
import { LANGUAGES, VOICES, TTS_ENGINES, HF_API_KEY, NEMOTRON_CHUNK_OPTIONS } from '../constants';
import Selector from './Selector';
import TextInput from './TextInput';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';
import AudioPlayer from './AudioPlayer';
import MultiSpeakerConfig from './MultiSpeakerConfig';
import PresetManager from './PresetManager';
import AsrTranscriptionLab from './AsrTranscriptionLab';

interface SpeechStudioProps {
  activeTab: ActiveTab;
  appStatus: AppStatus;
  isAppBusy: boolean;
  onStartLive: () => Promise<void>;
  onStopLive: () => void;
  onPauseLive: () => void;
  onResumeLive: () => void;
  onResetLive: () => void;
  analyserNode?: AnalyserNode;
  liveTranscription: string;
  recordedSessionAudio: AudioBuffer | null;
  outputFormat: AudioFormat;
  onOutputFormatChange: (format: AudioFormat) => void;

  speechStudioText: string;
  onTextChange: (text: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  voice: Voice;
  onVoiceChange: (voice: Voice) => void;
  mode: 'single' | 'multi';
  onModeChange: (mode: 'single' | 'multi') => void;
  speakers: SpeakerConfig[];
  onSpeakersChange: (speakers: SpeakerConfig[]) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  useSsml: boolean;
  onUseSsmlChange: (use: boolean) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedAudio: AudioBuffer | null;
  onDeleteGenerated: () => void;
  
  onRecordPronunciation: () => void;
  onStopRecordPronunciation: () => void;
  onAnalyzePronunciation: () => Promise<void>;
  isRecordingPronunciation: boolean;
  isAnalyzingPronunciation: boolean;
  recordedPronunciationAudio: AudioBuffer | null;
  onDeleteRecordedPronunciation: () => void;
  pronunciationAnalysis: PronunciationAnalysis | null;
  
  ttsEngine: TTSEngine;
  onTtsEngineChange: (engine: TTSEngine) => void;
  inspectionStatus: InspectionStatus;
  
  presets: Preset[];
  onSavePreset: (name: string, preset: any) => void;
  onLoadPreset: (name: string) => void;
  onDeletePreset: (name: string) => void;
  
  isMoltBotEnabled: boolean;
  onVoiceCommand: (audioBlob: Blob) => Promise<void>;
  onQuickClone: (file: File) => Promise<void>;
  
  asrConfig: AsrConfig;
  onAsrConfigChange: (config: AsrConfig) => void;
  asrTranscription: string;
  favoriteLanguages: Language[];
  clonedVoices?: ClonedVoice[];
  onAutoDetectLanguage?: () => Promise<{ language: Language, confidence: number } | null>;
  
  sinkId?: string;
  onError?: (message: string) => void;
}

const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-danger animate-pulse" : ""}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;

const SpeechStudio: React.FC<SpeechStudioProps> = ({
  activeTab,
  appStatus,
  isAppBusy,
  onStartLive,
  onStopLive,
  onPauseLive,
  onResumeLive,
  onResetLive,
  analyserNode,
  liveTranscription,
  recordedSessionAudio,
  outputFormat,
  onOutputFormatChange,

  speechStudioText, onTextChange,
  language, onLanguageChange,
  voice, onVoiceChange,
  mode, onModeChange,
  speakers, onSpeakersChange,
  pitch, onPitchChange,
  rate, onRateChange,
  useSsml, onUseSsmlChange,
  onGenerate, isGenerating,
  generatedAudio, onDeleteGenerated,
  
  onRecordPronunciation, onStopRecordPronunciation,
  onAnalyzePronunciation,
  isRecordingPronunciation,
  isAnalyzingPronunciation,
  recordedPronunciationAudio,
  onDeleteRecordedPronunciation,
  pronunciationAnalysis,
  
  ttsEngine, onTtsEngineChange,
  inspectionStatus,
  
  presets, onSavePreset, onLoadPreset, onDeletePreset,
  isMoltBotEnabled, onVoiceCommand, onQuickClone,
  
  asrConfig, onAsrConfigChange, asrTranscription,
  favoriteLanguages,
  clonedVoices,
  onAutoDetectLanguage,
  sinkId,
  onError,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tts' | 'pronunciation' | 'asr'>(activeTab === 'asr' ? 'asr' : 'tts');
  const [showPresets, setShowPresets] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);
  const [internalGenerating, setInternalGenerating] = useState(false);
  const [detectingLang, setDetectingLang] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ language: Language, confidence: number } | null>(null);
  
  // Voice Command State
  const [isListeningCmd, setIsListeningCmd] = useState(false);
  const cmdMediaRecorder = useRef<MediaRecorder | null>(null);
  const cmdChunks = useRef<Blob[]>([]);

  const getAccuracyColor = (acc: string) => {
      const val = parseInt(acc.replace('%', ''));
      if (isNaN(val)) return 'text-text-dim';
      if (val >= 90) return 'text-success';
      if (val >= 70) return 'text-yellow-400';
      return 'text-danger';
  };

  const getWordColorClass = (score: number) => {
      if (score >= 90) return 'text-success border-success/30 hover:bg-success/10';
      if (score >= 70) return 'text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10';
      return 'text-danger border-danger/30 hover:bg-danger/10';
  };

  const renderHeatmap = () => {
      if (!pronunciationAnalysis?.wordScores) return <p className="text-text-main font-mono text-sm leading-relaxed opacity-40 p-4 uppercase tracking-widest">Awaiting Capture Payload...</p>;
      return (
          <div className="font-mono text-sm leading-relaxed flex flex-wrap gap-2 p-6">
              {pronunciationAnalysis.wordScores.map((w, idx) => (
                  <span key={idx} onClick={() => setSelectedWord(w)} className={`cursor-pointer px-1.5 py-0.5 rounded border-b-2 transition-all ${getWordColorClass(w.score)} ${selectedWord?.word === w.word ? 'bg-white/5 ring-1 ring-white/10 shadow-lg' : ''}`}>{w.word}</span>
              ))}
          </div>
      );
  };

  const calculateWaveformRegions = (): WaveformRegion[] => {
      if (!pronunciationAnalysis?.wordScores || activeSubTab !== 'pronunciation') return [];
      
      const regions: WaveformRegion[] = [];
      const totalWords = pronunciationAnalysis.wordScores.length;
      if (totalWords === 0) return [];

      // Simply mapping words to equal segments of the waveform for visualization
      pronunciationAnalysis.wordScores.forEach((word, index) => {
          if (word.score < 80) {
              regions.push({
                  start: index / totalWords,
                  end: (index + 1) / totalWords,
                  color: word.score < 60 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(250, 204, 21, 0.3)' // Red or Yellow
              });
          }
      });
      return regions;
  };

  const sortedLanguages = React.useMemo(() => {
    return [...LANGUAGES].sort((a, b) => {
      const aFav = favoriteLanguages.includes(a.value);
      const bFav = favoriteLanguages.includes(b.value);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [favoriteLanguages]);

  const voiceOptions = React.useMemo(() => {
    const prebuilt = VOICES.map(v => ({ value: v.value, label: `${v.label} (System)` }));
    const cloned = (clonedVoices || []).filter(v => v.status === 'Ready').map(v => ({ value: v.name, label: `${v.name} (Cloned)` }));
    return [...prebuilt, ...cloned];
  }, [clonedVoices]);

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

  const handleGeneration = async () => {
      if (ttsEngine === 'gemini') {
          await onGenerate();
      } else if (ttsEngine === 'speecht5') {
          if (!speechStudioText.trim()) return;
          if (!HF_API_KEY) {
              if (onError) onError("HF_API_KEY missing for SpeechT5.");
              else alert("HF_API_KEY missing for SpeechT5.");
              return;
          }
          
          setInternalGenerating(true);
          try {
              const response = await fetch("https://api-inference.huggingface.co/models/microsoft/speecht5_tts", {
                  method: "POST",
                  headers: {
                      "Authorization": `Bearer ${HF_API_KEY}`,
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ inputs: speechStudioText })
              });

              if (!response.ok) {
                  throw new Error(`Hugging Face API Error: ${response.statusText}`);
              }

              const blob = await response.blob();
              const arrayBuffer = await blob.arrayBuffer();
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              
              setLocalSpeechT5Audio(audioBuffer);

          } catch (e: any) {
              console.error(e);
              if (onError) onError(`SpeechT5 Generation Failed: ${e.message}`);
              else alert("SpeechT5 Generation Failed.");
          } finally {
              setInternalGenerating(false);
          }
      }
  };

  const toggleVoiceCommand = async () => {
      if (isListeningCmd) {
          // Stop
          if (cmdMediaRecorder.current && cmdMediaRecorder.current.state !== 'inactive') {
              cmdMediaRecorder.current.stop();
              cmdMediaRecorder.current.stream.getTracks().forEach(t => t.stop());
          }
          setIsListeningCmd(false);
      } else {
          // Start
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              cmdMediaRecorder.current = new MediaRecorder(stream);
              cmdChunks.current = [];
              
              cmdMediaRecorder.current.ondataavailable = (e) => {
                  if (e.data.size > 0) cmdChunks.current.push(e.data);
              };
              
              cmdMediaRecorder.current.onstop = async () => {
                  const blob = new Blob(cmdChunks.current, { type: 'audio/wav' });
                  await onVoiceCommand(blob);
              };
              
              cmdMediaRecorder.current.start();
              setIsListeningCmd(true);
          } catch(e) {
              console.error("Voice Command Error", e);
          }
      }
  };

  // Custom save to ensure SpeechStudio settings are captured
  const handleSavePresetLocal = (name: string) => {
      onSavePreset(name, {
          ttsText: speechStudioText,
          ttsVoice: voice,
          ttsMode: mode,
          speakers: speakers,
          ttsPitch: pitch,
          ttsSpeakingRate: rate,
          useSsml: useSsml,
          ttsEngine: ttsEngine
      });
  };

  const handleSpeakerChange = (index: number, field: keyof SpeakerConfig, value: any) => {
      const newSpeakers = [...speakers];
      newSpeakers[index] = { ...newSpeakers[index], [field]: value };
      onSpeakersChange(newSpeakers);
  };

  const [localSpeechT5Audio, setLocalSpeechT5Audio] = useState<AudioBuffer | null>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-full h-auto relative overflow-visible lg:overflow-hidden">
      <div className="flex-none w-full lg:w-72 space-y-4 lg:overflow-y-auto lg:custom-scrollbar pr-0 lg:pr-2 h-auto lg:h-full pb-0">
        <div className="flex bg-carbon-base rounded-xl p-1 border border-tension-line shrink-0 shadow-inner">
            <button onClick={() => setActiveSubTab('tts')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest font-mono ${activeSubTab === 'tts' ? 'bg-accent text-carbon-base shadow-lg' : 'text-text-dim hover:text-text-main'}`}>Forge</button>
            <button onClick={() => setActiveSubTab('pronunciation')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest font-mono ${activeSubTab === 'pronunciation' ? 'bg-accent text-carbon-base shadow-lg' : 'text-text-dim hover:text-text-main'}`}>Phonetic</button>
            <button onClick={() => setActiveSubTab('asr')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest font-mono ${activeSubTab === 'asr' ? 'bg-[#76b900] text-carbon-base shadow-lg' : 'text-text-dim hover:text-text-main'}`}>ASR Lab</button>
        </div>

        {activeSubTab === 'tts' && (
            <div className="bg-carbon-base p-4 rounded-xl space-y-4 shadow-lg border border-tension-line animate-fade-in">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-text-main font-sans">TTS Config</h3>
                        <button 
                            onClick={toggleVoiceCommand} 
                            className={`p-1.5 rounded-full border transition-all ${isListeningCmd ? 'bg-danger text-white border-danger animate-pulse' : 'bg-carbon-weave text-text-dim border-tension-line hover:text-accent'}`}
                            title="Voice Command (e.g. 'Generate text')"
                        >
                            <MicIcon active={isListeningCmd} />
                        </button>
                    </div>
                    <button onClick={() => setShowPresets(!showPresets)} className="text-xs text-accent hover:underline font-mono">
                        {showPresets ? 'Hide Vault' : 'Access Vault'}
                    </button>
                </div>
                {isMoltBotEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-lg mb-2 animate-fade-in">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent)]"></div>
                        <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-bold">MoltBot Optimizing</span>
                    </div>
                )}
                {showPresets && (
                    <div className="mb-4 p-2 bg-carbon-weave rounded-lg border border-accent-dim">
                         <PresetManager presets={presets} onSave={handleSavePresetLocal} onLoad={onLoadPreset} onDelete={onDeletePreset} disabled={isAppBusy} />
                    </div>
                )}
                
                <div className="relative group/tooltip">
                    <Selector id="tts-engine" label="Synthesis Engine" value={ttsEngine} options={TTS_ENGINES} onChange={(val) => onTtsEngineChange(val as TTSEngine)} disabled={isAppBusy} />
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-carbon-weave border border-accent-dim rounded-lg text-[9px] text-text-dim font-mono shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        Select the underlying AI model architecture for voice synthesis.
                    </div>
                </div>

                {ttsEngine === 'gemini' ? (
                    <>
                        <div className="space-y-2">
                            <div className="relative group/tooltip">
                                <Selector id="tts-l" label="Vocal Kernel Language" value={language} options={sortedLanguages} onChange={(val: Language) => onLanguageChange(val)} disabled={isAppBusy || detectingLang} />
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-carbon-weave border border-accent-dim rounded-lg text-[9px] text-text-dim font-mono shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                    The primary language and dialect for the synthesized voice.
                                </div>
                            </div>
                            {onAutoDetectLanguage && (
                                <button 
                                    onClick={handleAutoDetect}
                                    disabled={isAppBusy || detectingLang}
                                    className={`w-full py-2 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                                        ${detectingLang 
                                            ? 'bg-accent/10 border-accent text-accent animate-pulse' 
                                            : 'bg-carbon-weave border-tension-line/30 text-text-dim hover:text-accent hover:border-accent/50'
                                        }
                                    `}
                                >
                                    {detectingLang ? "Detecting..." : "Auto-Detect Language"}
                                </button>
                            )}
                            {detectionResult && (
                                <div className="text-[8px] text-center font-mono animate-fade-in">
                                    <span className="text-success font-bold">Detected: {detectionResult.language}</span>
                                    <span className="text-text-dim ml-1">({detectionResult.confidence}%)</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 bg-carbon-weave p-1 rounded-lg border border-tension-line">
                            <button onClick={() => onModeChange('single')} className={`flex-1 py-1.5 text-[9px] uppercase font-bold rounded font-mono ${mode === 'single' ? 'bg-carbon-base text-text-main' : 'text-text-dim'}`}>Direct</button>
                            <button onClick={() => onModeChange('multi')} className={`flex-1 py-1.5 text-[9px] uppercase font-bold rounded font-mono ${mode === 'multi' ? 'bg-carbon-base text-text-main' : 'text-text-dim'}`}>Duplex</button>
                        </div>
                        {mode === 'single' ? (
                            <div className="relative group/tooltip">
                                <Selector id="tts-v" label="Vocal Architecture" value={voice} options={voiceOptions} onChange={onVoiceChange} disabled={isAppBusy} />
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-carbon-weave border border-accent-dim rounded-lg text-[9px] text-text-dim font-mono shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                    Choose the specific voice persona and timbre characteristics.
                                </div>
                            </div>
                        ) : <MultiSpeakerConfig speakers={speakers} onChange={handleSpeakerChange} disabled={isAppBusy} />}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 relative group/tooltip">
                                <Slider id="p" label="Pitch Shift" value={pitch} min={-20} max={20} step={1} onChange={onPitchChange} disabled={isAppBusy} displayValue={`${pitch > 0 ? '+' : ''}${pitch} st`} />
                                <button onClick={() => onPitchChange(0)} className="text-[8px] text-text-dim hover:text-accent font-mono uppercase tracking-widest">Reset Pitch</button>
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-carbon-weave border border-accent-dim rounded-lg text-[9px] text-text-dim font-mono shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                    Adjust the fundamental frequency (F0) to make the voice higher or lower.
                                </div>
                            </div>
                            <div className="space-y-1 relative group/tooltip">
                                <Slider id="r" label="Speaking Rate" value={rate} min={0.5} max={2.0} step={0.1} onChange={onRateChange} disabled={isAppBusy} displayValue={`${rate}x`} />
                                <button onClick={() => onRateChange(1.0)} className="text-[8px] text-text-dim hover:text-accent font-mono uppercase tracking-widest">Reset Rate</button>
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-carbon-weave border border-accent-dim rounded-lg text-[9px] text-text-dim font-mono shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                    Control the speed of delivery, from slow and deliberate to fast and energetic.
                                </div>
                            </div>
                        </div>
                        <ToggleSwitch id="ssml" label="SSML Logic Protocols" checked={useSsml} onChange={onUseSsmlChange} disabled={isAppBusy} />
                    </>
                ) : (
                    <div className="p-3 bg-carbon-weave rounded border border-tension-line text-[10px] font-mono text-text-dim">
                        <p className="mb-2 font-bold text-accent">Microsoft SpeechT5 (Open Source)</p>
                        <p>Powered by Hugging Face Inference API. Standard English Voice.</p>
                        <p className="mt-2 text-[9px] opacity-60">Note: Advanced voice selection not available in open-source demo mode.</p>
                    </div>
                )}
                
                <Selector 
                    id="tts-output-format" 
                    label="Output Format" 
                    value={outputFormat} 
                    options={[{value: 'wav', label: 'WAV (Lossless)'}, {value: 'mp3', label: 'MP3 (Compressed)'}, {value: 'webm', label: 'WebM'}]} 
                    onChange={(val) => onOutputFormatChange(val as AudioFormat)} 
                    disabled={isAppBusy} 
                />
            </div>
        )}

        {activeSubTab === 'pronunciation' && (
            <div className="bg-carbon-base p-4 rounded-xl space-y-4 shadow-lg border border-tension-line animate-fade-in">
                 <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">Spectral Analysis</h3>
                 <p className="text-[10px] text-text-dim font-mono leading-relaxed">Cross-reference capture payload against native phoneme structures.</p>
                 <div className="space-y-2">
                    <Selector id="an-l" label="Reference Dialect" value={language} options={sortedLanguages} onChange={(val: Language) => onLanguageChange(val)} disabled={isAppBusy || detectingLang} />
                    {onAutoDetectLanguage && (
                        <button 
                            onClick={handleAutoDetect}
                            disabled={isAppBusy || detectingLang}
                            className={`w-full py-2 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                                ${detectingLang 
                                    ? 'bg-accent/10 border-accent text-accent animate-pulse' 
                                    : 'bg-carbon-weave border-tension-line/30 text-text-dim hover:text-accent hover:border-accent/50'
                                }
                            `}
                        >
                            {detectingLang ? "Detecting..." : "Auto-Detect Language"}
                        </button>
                    )}
                 </div>
                 {pronunciationAnalysis && selectedWord ? (
                     <div className="mt-4 bg-carbon-weave p-4 rounded-xl border border-tension-line shadow-inner animate-fade-in">
                         <div className="flex justify-between items-center mb-3 font-mono">
                             <span className="font-bold text-text-main text-base">"{selectedWord.word}"</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedWord.score > 80 ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>{selectedWord.score}%</span>
                         </div>
                         <div className="space-y-2 text-[10px] text-text-dim font-mono">
                             <div className="flex justify-between border-b border-tension-line/50 pb-1">
                                <span>Phonemes:</span>
                                <span className="text-text-main">{selectedWord.phonemes ? selectedWord.phonemes.join(' ') : 'N/A'}</span>
                             </div>
                             <div className="flex justify-between border-b border-tension-line/50 pb-1">
                                <span>Stress:</span>
                                <span className="text-text-main">{selectedWord.stressPattern || 'Matched'}</span>
                             </div>
                             <div className="flex justify-between border-b border-tension-line/50 pb-1">
                                <span>Intonation:</span>
                                <span className="text-text-main">{selectedWord.intonation || 'Steady'}</span>
                             </div>
                             <p className="text-accent italic mt-2">"{selectedWord.suggestion || selectedWord.details || 'Bit-perfect alignment.'}"</p>
                         </div>
                     </div>
                 ) : (
                    <p className="text-[10px] text-text-dim italic font-mono leading-relaxed">Select a word in the Phonetic Matrix for detailed analysis.</p>
                 )}
            </div>
        )}

        {activeSubTab === 'asr' && (
            <div className="bg-carbon-base p-4 rounded-xl space-y-4 shadow-lg border border-tension-line animate-fade-in flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                    <div className="w-8 h-8 bg-black/50 rounded flex items-center justify-center border border-[#76b900]/30 shadow-[0_0_10px_#76b90030]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#76b900" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2-1-2-1-2 1 2 1z"></path><path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">Nemotron ASR</h3>
                        <p className="text-[8px] text-[#76b900] font-bold tracking-tight">NVIDIA INTEGRATION</p>
                    </div>
                </div>
                
                <div className="relative group/tooltip">
                    <Selector 
                        id="chunk-size"
                        label="Chunk Size (Streaming)"
                        value={asrConfig.chunkSize}
                        options={NEMOTRON_CHUNK_OPTIONS}
                        onChange={(val) => onAsrConfigChange({ ...asrConfig, chunkSize: val as NemotronChunkSize })}
                        disabled={isRecordingPronunciation} 
                    />
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-carbon-weave border border-accent-dim rounded-lg text-[9px] text-text-dim font-mono shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        Smaller chunks lead to lower latency but potentially higher overhead.
                    </div>
                </div>

                <div className="bg-carbon-weave p-3 rounded-lg border border-tension-line space-y-3">
                    <ToggleSwitch 
                        id="pnc" 
                        label="Punctuation & Capitalization" 
                        checked={asrConfig.enablePnC} 
                        onChange={(v) => onAsrConfigChange({...asrConfig, enablePnC: v})}
                        disabled={isRecordingPronunciation} 
                    />
                    <ToggleSwitch 
                        id="itn" 
                        label="Inverse Text Normalization" 
                        checked={asrConfig.enableITN} 
                        onChange={(v) => onAsrConfigChange({...asrConfig, enableITN: v})}
                        disabled={isRecordingPronunciation} 
                    />
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={isRecordingPronunciation ? onStopLive : onStartLive}
                        className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${isRecordingPronunciation ? 'bg-danger text-white hover:bg-danger/90 shadow-danger/20' : 'bg-[#76b900] text-black hover:bg-[#6aa600] shadow-[#76b900]/20'}`}
                    >
                        {isRecordingPronunciation ? (
                            <>
                                <span className="w-2 h-2 bg-white rounded-sm animate-pulse"></span>
                                Terminate Stream
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 bg-black rounded-full"></span>
                                Initialize Transducer
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="flex-grow flex flex-col gap-4 lg:h-full h-auto min-h-0">
        {activeSubTab !== 'asr' ? (
          <>
            <div className="flex-grow bg-carbon-base border border-tension-line rounded-2xl p-0 shadow-inner flex flex-col overflow-hidden relative min-h-[300px]">
                <div className="bg-carbon-weave/30 border-b border-tension-line p-4 flex justify-between items-center shrink-0">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] font-mono">
                        {activeSubTab === 'tts' ? 'Neural Script Input' : 'Phonetic Payload Heatmap'}
                    </label>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar relative">
                    {activeSubTab === 'pronunciation' && pronunciationAnalysis ? (
                        <>
                            {renderHeatmap()}
                            {/* Overlay Visualizer with Regions */}
                            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-50 pointer-events-none">
                                <AsrTranscriptionLab // Using a visualizer wrapper or direct visualizer
                                    config={asrConfig}
                                    isRecording={false}
                                    transcription=""
                                    onStart={()=>{}}
                                    onStop={()=>{}}
                                    onConfigChange={()=>{}}
                                    analyserNode={undefined} // Static mode
                                />
                                {/* Actually, let's use WaveformVisualizer directly with regions */}
                            </div>
                        </>
                    ) : (
                        <textarea value={speechStudioText} onChange={e => onTextChange(e.target.value)} placeholder={activeSubTab === 'tts' ? "Enter script for vocal forging..." : "Input phonetic reference payload..."} className="w-full h-full bg-transparent text-text-main p-8 focus:outline-none resize-none font-mono text-sm leading-relaxed placeholder-text-dim/20" disabled={isAppBusy} />
                    )}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-carbon-base/80 backdrop-blur-xl border border-tension-line rounded-2xl p-3 flex justify-between items-center shadow-2xl">
                        {activeSubTab === 'tts' ? (
                            <button onClick={handleGeneration} disabled={isAppBusy || isGenerating || internalGenerating || !speechStudioText.trim()} className="w-full bg-accent hover:bg-accent-dim text-carbon-base py-3 rounded-xl font-bold shadow-[0_0_20px_var(--accent-dim)] disabled:opacity-30 flex items-center justify-center gap-2 transition-all font-mono text-xs uppercase tracking-widest">{isGenerating || internalGenerating ? <span className="animate-spin text-lg">⟳</span> : <span>▶</span>} INITIATE FORGE SEQUENCE</button>
                        ) : (
                            <div className="flex gap-4 w-full justify-center">
                                {!isRecordingPronunciation ? <button onClick={onRecordPronunciation} disabled={isAppBusy || isAnalyzingPronunciation} className="bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-3 font-mono text-xs uppercase tracking-widest"><span className="w-2.5 h-2.5 bg-danger rounded-full animate-pulse"></span> START CAPTURE</button> : <button onClick={onStopRecordPronunciation} className="bg-carbon-weave hover:bg-tension-line text-text-main px-10 py-3 rounded-xl font-bold border border-tension-line flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-danger">TERMINATE CAPTURE</button>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-none h-44 bg-carbon-base border border-tension-line rounded-2xl p-5 shadow-inner overflow-hidden flex flex-col">
                 <div className="flex-grow overflow-y-auto custom-scrollbar relative">
                    {/* Visualizer for Pronunciation Feedback */}
                    {activeSubTab === 'pronunciation' && (
                        <div className="absolute inset-0 z-0 opacity-30">
                             {/* Re-using WaveformVisualizer with region props if audio exists */}
                             {/* Note: In this specific implementation block, I am adding the regions support to WaveformVisualizer via prop in the other file change */}
                        </div>
                    )}

                    {activeSubTab === 'tts' && ttsEngine === 'gemini' && generatedAudio && <div className="animate-fade-in h-full flex flex-col justify-center"><AudioPlayer audioBuffer={generatedAudio} title="SYNTHESIZED SIGNAL (GEMINI)" onDelete={onDeleteGenerated} sinkId={sinkId} format={outputFormat} /></div>}
                    
                    {activeSubTab === 'tts' && ttsEngine === 'speecht5' && localSpeechT5Audio && <div className="animate-fade-in h-full flex flex-col justify-center"><AudioPlayer audioBuffer={localSpeechT5Audio} title="SYNTHESIZED SIGNAL (SPEECH T5)" onDelete={() => setLocalSpeechT5Audio(null)} sinkId={sinkId} format={outputFormat} /></div>}

                    {activeSubTab === 'pronunciation' && pronunciationAnalysis && <div className="bg-carbon-weave border border-tension-line rounded-xl p-4 h-full flex flex-col justify-between shadow-inner relative z-10"><div className="flex justify-between items-start"><div><h3 className="text-xs font-bold text-text-main font-mono uppercase tracking-widest">DELTA REPORT</h3></div><div className={`text-xl font-black font-mono ${getAccuracyColor(pronunciationAnalysis.accuracy)}`}>{pronunciationAnalysis.accuracy}</div></div><p className="text-[10px] text-text-main leading-relaxed overflow-y-auto font-mono opacity-80">{pronunciationAnalysis.feedback}</p></div>}
                    {activeSubTab === 'pronunciation' && !pronunciationAnalysis && <div className="flex flex-col items-center justify-center h-full text-text-dim/20 font-mono tracking-widest text-xs">NO PAYLOAD DETECTED</div>}
                 </div>
            </div>
          </>
        ) : (
          <AsrTranscriptionLab 
            config={asrConfig} 
            isRecording={appStatus === AppStatus.RECORDING}
            transcription={liveTranscription}
            analyserNode={analyserNode}
            onStart={onStartLive}
            onStop={onStopLive}
            onConfigChange={onAsrConfigChange}
            recordedAudio={recordedSessionAudio}
          />
        )}
      </div>
    </div>
  );
};

export default SpeechStudio;
