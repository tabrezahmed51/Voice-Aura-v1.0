
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BaseVoice, VoiceAnalysis, Gender, Accent, Tone, ClonedVoice, VoiceStatus, VoicePriority } from '../types';
import { VOICES, GENDERS, ACCENTS, TONES, VOICE_STATUSES, VOICE_PRIORITIES } from '../constants';
import Selector from './Selector';
import TextInput from './TextInput';
import FileUpload from './FileUpload';
import ProgressVisualizer from './ProgressVisualizer';
import VocalFingerprint from './VocalFingerprint';

interface CloneVoiceFormProps {
  onClone: (voiceData: Omit<ClonedVoice, 'createdAt' | 'status' | 'priority' | 'id'>, duration?: number) => void;
  onAnalyze: (file: File) => Promise<VoiceAnalysis | null>;
  onImport: (url: string) => void;
  isAppBusy: boolean;
  isCloning: boolean;
  cloningStatusMessage: string;
  cloningProgress: number;
  cloningTimeRemaining: number | null;
  clonedVoices: ClonedVoice[];
  serverError: string | null;
}

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const RetryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const AlertTriangle = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

const StepIndicator = ({ label, active, completed, stepIndex, totalSteps }: { label: string, active: boolean, completed: boolean, stepIndex: number, totalSteps: number }) => (
    <div className={`flex flex-col items-center gap-1 flex-1 relative ${active ? 'text-text-main' : completed ? 'text-success' : 'text-text-dim'}`}>
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold transition-all duration-300 z-10 bg-bg 
            ${active ? 'border-accent text-accent shadow-[0_0_10px_var(--accent-dim)]' : 
            completed ? 'border-success bg-success text-carbon-base border-transparent' : 'border-tension-line'}`}>
            {completed ? '✓' : stepIndex}
        </div>
        <span className="text-[8px] sm:text-[10px] uppercase font-mono font-bold tracking-wider text-center">{label}</span>
        {stepIndex < totalSteps && ( 
            <div className={`absolute top-3 sm:top-4 left-1/2 w-full h-0.5 -z-0 transform translate-x-[50%] ${completed ? 'bg-success/50' : 'bg-tension-line'}`}></div>
        )}
    </div>
);

const CloneVoiceForm: React.FC<CloneVoiceFormProps> = ({ 
    onClone, onAnalyze, onImport, isAppBusy, isCloning, cloningStatusMessage, cloningProgress, cloningTimeRemaining, clonedVoices, serverError 
}) => {
  const [name, setName] = useState('');
  const [baseVoice, setBaseVoice] = useState<BaseVoice>('Zephyr'); 
  const [gender, setGender] = useState<Gender>('Unspecified'); 
  const [accent, setAccent] = useState<Accent>('Neutral');
  const [tone, setTone] = useState<Tone>('Neutral');
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [errors, setErrors] = useState<{name?: string, file?: string, importUrl?: string}>({});
  const [analysisPreview, setAnalysisPreview] = useState<VoiceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Quality Monitoring State
  const [isClipping, setIsClipping] = useState(false);
  const [clarityScore, setClarityScore] = useState(100);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<VoiceStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<VoicePriority | 'all'>('all');
  const [dragActive, setDragActive] = useState(false);

  const filteredVoices = useMemo(() => {
      return clonedVoices.filter(voice => {
          const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = filterStatus === 'all' || voice.status === filterStatus;
          const matchesPriority = filterPriority === 'all' || voice.priority === filterPriority;
          return matchesSearch && matchesStatus && matchesPriority;
      });
  }, [clonedVoices, searchTerm, filterStatus, filterPriority]);

  const validateName = (value: string): string | undefined => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Please enter a name for the voice.';
    if (trimmedValue.length < 2 || trimmedValue.length > 30) return 'Name must be 2-30 characters.';
    if (!/^[a-zA-Z0-9 _-]+$/.test(trimmedValue)) return 'Name can only contain letters, numbers, spaces, underscores, and hyphens.';
    if (clonedVoices.some(v => v.name.toLowerCase() === trimmedValue.toLowerCase())) return 'A voice with this name already exists.';
    return undefined;
  }

  const handleFile = (file: File) => {
    setAudioFile(null);
    setAnalysisPreview(null);
    setAudioDuration(0);

    if (!file.type.startsWith('audio/')) {
        setErrors(prev => ({...prev, file: 'Invalid format. Please upload an audio file (WAV/MP3).'}));
        return;
    }

    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      setAudioDuration(audio.duration);
      if (audio.duration < 5) {
        setErrors(prev => ({...prev, file: 'Audio is too short. Minimum 5 seconds required.'}));
      } else if (audio.duration > 30) {
        setErrors(prev => ({...prev, file: 'Audio is too long. Maximum 30 seconds allowed.'}));
      } else {
        setErrors(prev => ({...prev, file: undefined}));
        setAudioFile(file);
      }
    };
    audio.onerror = () => {
        setErrors(prev => ({...prev, file: 'Failed to load audio file. It may be corrupted.'}));
    };
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
          setDragActive(true);
      } else if (e.type === "dragleave") {
          setDragActive(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
      }
  };

  const checkAudioQuality = () => {
      if (!analyserRef.current) return;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);

      let clipping = false;
      let sum = 0;

      for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          if (val === 0 || val === 255) { // 8-bit PCM clipping
              clipping = true;
          }
          sum += Math.abs(val - 128); // deviation from silence
      }

      const avgAmplitude = sum / bufferLength;
      // Simple clarity score: Too quiet is bad, too loud (clipping) is bad
      let score = 100;
      if (clipping) score -= 50;
      if (avgAmplitude < 10) score -= 30; // Too quiet
      
      setIsClipping(clipping);
      setClarityScore(Math.max(0, score));

      rafRef.current = requestAnimationFrame(checkAudioQuality);
  };

  const handleStartRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          // Audio Context for analysis
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          analyserRef.current = analyser;

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.start();
          setIsRecording(true);
          setRecordingTime(0);
          setAudioFile(null);
          setErrors(prev => ({...prev, file: undefined}));
          setIsClipping(false);
          setClarityScore(100);

          timerRef.current = window.setInterval(() => {
              setRecordingTime(prev => {
                  if (prev >= 30) {
                      handleStopRecording();
                      return 30;
                  }
                  return prev + 1;
              });
          }, 1000);

          checkAudioQuality();

      } catch (err) {
          console.error("Microphone access denied:", err);
          setErrors(prev => ({...prev, file: "Microphone access denied."}));
      }
  };

  const handleStopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          if (audioContextRef.current) audioContextRef.current.close();

          mediaRecorderRef.current.onstop = () => {
              const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              const file = new File([blob], "recorded_sample.wav", { type: 'audio/wav' });
              
              const audio = new Audio(URL.createObjectURL(blob));
              audio.onloadedmetadata = () => {
                  setAudioDuration(audio.duration);
              };

              if (recordingTime < 5) {
                  setErrors(prev => ({...prev, file: "Recording too short (min 5s)."}));
              } else {
                  setAudioFile(file);
              }
              setIsRecording(false);
              if (timerRef.current) clearInterval(timerRef.current);
          };
      }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newName = event.target.value;
      setName(newName);
      setErrors(prev => ({ ...prev, name: validateName(newName) }));
  }

  const handleAnalyzeClick = async () => {
    if (!audioFile) return;
    setIsAnalyzing(true);
    setErrors(prev => ({ ...prev, file: undefined }));
    const result: VoiceAnalysis | null = await onAnalyze(audioFile); 
    if (result) {
        setAnalysisPreview(result);
        if (result.pitch) {
            const pitchStr = result.pitch.toLowerCase();
            if (pitchStr.includes('high')) { setGender('Female'); setBaseVoice('Kore'); }
            else if (pitchStr.includes('low')) { setGender('Male'); setBaseVoice('Puck'); }
            else { setGender('Unspecified'); setBaseVoice('Zephyr'); } 
        }
        if (result.accent) {
            const matchedAccent = ACCENTS.find(a => a.label.toLowerCase() === result.accent?.toLowerCase());
            if (matchedAccent) setAccent(matchedAccent.value);
        }
        if (result.tone) {
            const matchedTone = TONES.find(t => t.label.toLowerCase() === result.tone?.toLowerCase());
            if (matchedTone) setTone(matchedTone.value);
        }
    }
    setIsAnalyzing(false);
  };

  const handleCloneClick = () => {
    const nameError = validateName(name);
    let fileError = errors.file;
    if (!audioFile && !fileError) fileError = 'Please select a valid audio file.';
    
    if (nameError || fileError) {
        setErrors({ ...errors, name: nameError, file: fileError });
        return;
    }

    if (name.trim() && audioFile) {
        onClone({ 
            name: name.trim(), 
            baseVoice, 
            gender, 
            accent, 
            tone, 
            notes, 
            rating: analysisPreview?.qualityScore 
        }, audioDuration);
        
        setName('');
        setAudioFile(null);
        setAnalysisPreview(null);
        setNotes('');
        const fileInput = document.getElementById('audio-upload-input') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }
  };

  const handleRetry = (voice: ClonedVoice) => {
      onClone({
          name: voice.name + " (Retry)",
          baseVoice: voice.baseVoice,
          gender: voice.gender,
          accent: voice.accent,
          tone: voice.tone,
          notes: voice.notes,
          rating: voice.rating
      }, 10); // Default duration for retry if not known
  };
  
  const handleImportClick = () => {
    setErrors(prev => ({...prev, importUrl: undefined}));
    if (!importUrl) {
        setErrors(prev => ({...prev, importUrl: 'Please enter a URL.'}));
        return;
    }
    try {
        new URL(importUrl);
    } catch (_) {
        setErrors(prev => ({...prev, importUrl: 'Invalid URL format.'}));
        return;
    }
    onImport(importUrl);
    setImportUrl(''); 
  }

  const isFormValid = !validateName(name) && audioFile && !errors.file;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-full">
        <div className="tension-panel rounded-xl flex flex-col h-auto lg:h-full lg:overflow-y-auto custom-scrollbar border border-tension-line/30 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-text-main font-sans shrink-0 neon-text">Create New Voice Model</h3>
            <div className="space-y-4 flex-grow">
                
                <div 
                    className={`bg-carbon-base/50 p-4 rounded-lg border border-dashed transition-colors relative ${dragActive ? 'border-accent bg-accent/5 shadow-glow-accent' : 'border-tension-line/50'}`}
                    onDragEnter={handleDrag} 
                    onDragLeave={handleDrag} 
                    onDragOver={handleDrag} 
                    onDrop={handleDrop}
                >
                    <label className="text-[10px] sm:text-xs font-mono font-medium text-text-dim mb-2 block text-center uppercase tracking-widest">
                        1. Upload Audio Sample (5-30s)
                    </label>
                    <div className="flex flex-col gap-3">
                        <div className="text-center">
                            <p className="text-[9px] text-text-dim mb-2 font-mono">Drag & Drop WAV/MP3 here</p>
                            <FileUpload
                                id="audio-upload-input"
                                label="" // Hidden label
                                onChange={handleFileChange}
                                disabled={isAppBusy || isRecording}
                                accept="audio/*"
                                error={null}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-px bg-tension-line flex-grow opacity-30"></div>
                            <span className="text-[9px] text-text-dim uppercase font-mono">OR RECORD</span>
                            <div className="h-px bg-tension-line flex-grow opacity-30"></div>
                        </div>
                        <button
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            disabled={isAppBusy || (audioFile !== null && !isRecording)}
                            className={`w-full py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                isRecording 
                                ? 'bg-danger text-white animate-pulse shadow-glow-red' 
                                : 'bg-carbon-weave text-text-main border border-tension-line/30 hover:bg-tension-line hover:border-accent hover:text-accent'
                            }`}
                        >
                            {isRecording ? <><StopIcon /> STOP ({recordingTime}s)</> : <><MicIcon /> RECORD AUDIO</>}
                        </button>
                    </div>
                    {isRecording && (
                        <div className="mt-2 bg-black/30 p-2 rounded border border-tension-line/30">
                            <div className="flex justify-between items-center text-[9px] font-mono text-text-dim mb-1">
                                <span>Quality Monitor</span>
                                <span className={isClipping ? 'text-danger' : clarityScore < 50 ? 'text-yellow-500' : 'text-success'}>
                                    {isClipping ? 'CLIPPING DETECTED' : clarityScore > 80 ? 'EXCELLENT' : 'NOISY'}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-carbon-base rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-200 ${isClipping ? 'bg-danger shadow-[0_0_5px_var(--danger)]' : clarityScore < 50 ? 'bg-yellow-500 shadow-[0_0_5px_var(--warning)]' : 'bg-success shadow-[0_0_5px_var(--success)]'}`} 
                                    style={{ width: `${clarityScore}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    {errors.file && <p className="text-danger text-[10px] sm:text-xs mt-2 font-mono text-center">{errors.file}</p>}
                    {audioFile && !isRecording && (
                        <div className="mt-2 text-[10px] text-success font-mono flex items-center justify-center gap-1 bg-success/10 py-1 rounded border border-success/20 shadow-[0_0_5px_var(--success-dim)]">
                            <span>✓ Ready:</span> <span className="text-text-main truncate max-w-[150px]">{audioFile.name}</span>
                            <span className="text-text-dim">({audioDuration.toFixed(1)}s)</span>
                        </div>
                    )}
                </div>

                {audioFile && (
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isAppBusy || isAnalyzing}
                        className="w-full text-xs bg-carbon-weave text-text-dim px-3 py-2 rounded hover:bg-tension-line disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors border border-tension-line/30 shadow-sm font-mono hover:text-accent hover:border-accent"
                    >
                        {isAnalyzing ? 'Analyzing Sample...' : 'Analyze Audio Quality'}
                    </button>
                )}
                
                {analysisPreview && (
                    <div className="animate-fade-in">
                        <VocalFingerprint similarity={analysisPreview.qualityScore ? analysisPreview.qualityScore / 100 : 0.85} />
                        <div className="p-3 bg-carbon-base/80 backdrop-blur-md rounded-lg border border-accent-dim text-xs mt-4 shadow-inner font-mono relative overflow-hidden">
                            {analysisPreview.hasClipping && (
                                <div className="bg-yellow-500/10 border-l-2 border-yellow-500 p-2 mb-2 flex gap-2 items-start text-yellow-200">
                                    <AlertTriangle />
                                    <div>
                                        <p className="font-bold">Distortion Detected</p>
                                        <p className="opacity-80 text-[10px]">The audio has clipping. Re-recording is recommended for better quality.</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-accent neon-text">Analysis Report</span>
                                <span className={`text-lg font-black ${analysisPreview.qualityScore && analysisPreview.qualityScore > 80 ? 'text-success shadow-glow-green' : 'text-yellow-400'}`}>
                                    {analysisPreview.qualityScore}<span className="text-[10px] text-text-dim">/100</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-text-dim">
                                <p>Pitch: <span className="text-text-main">{analysisPreview.pitch}</span></p>
                                <p>Tone: <span className="text-text-main">{analysisPreview.tone}</span></p>
                                <p>Accent: <span className="text-text-main">{analysisPreview.accent}</span></p>
                                <p>Style: <span className="text-text-main">{analysisPreview.style}</span></p>
                            </div>
                        </div>
                    </div>
                )}

                <TextInput
                    id="clone-voice-name"
                    label="2. Name Your Voice"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g., My Custom Voice"
                    disabled={isAppBusy}
                    error={errors.name}
                    maxLength={30}
                />
                
                <div className="border-t border-tension-line/30 pt-4 mt-2">
                    <details className="group">
                        <summary className="flex justify-between items-center font-mono cursor-pointer list-none text-sm text-text-dim hover:text-text-main transition-colors">
                            <span>3. Advanced Settings (Optional)</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="text-text-dim mt-3 group-open:animate-fade-in space-y-4">
                            <Selector id="base-voice-selector" label="Base Voice Model" value={baseVoice} options={VOICES} onChange={(val) => setBaseVoice(val as BaseVoice)} disabled={isAppBusy} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Selector id="gender-selector" label="Gender" value={gender} options={GENDERS} onChange={(val) => setGender(val as Gender)} disabled={isAppBusy} />
                                <Selector id="accent-selector" label="Accent Tuning" value={accent} options={ACCENTS} onChange={(val) => setAccent(val as Accent)} disabled={isAppBusy} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Selector id="tone-selector" label="Default Tone" value={tone} options={TONES} onChange={(val) => setTone(val as Tone)} disabled={isAppBusy} />
                            </div>
                            <div>
                                <label htmlFor="clone-notes" className="text-sm font-mono font-medium text-text-dim mb-1 block">Notes</label>
                                <textarea id="clone-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-carbon-base/50 border border-tension-line/30 text-text-main text-sm rounded-lg p-2 font-mono focus:ring-accent focus:border-accent shadow-inner placeholder-text-dim/30" placeholder="Add notes for future improvement..." />
                            </div>
                        </div>
                    </details>
                </div>

                {isCloning && (
                    <div className="bg-carbon-base/30 p-4 rounded-lg border border-accent-dim animate-fade-in mt-4 shadow-glow-accent">
                        <div className="flex justify-between px-1 mb-6 overflow-x-auto gap-2">
                            <StepIndicator label="Upload" stepIndex={1} active={cloningProgress < 15} completed={cloningProgress >= 15} totalSteps={5} />
                            <StepIndicator label="Analysis" stepIndex={2} active={cloningProgress >= 15 && cloningProgress < 35} completed={cloningProgress >= 35} totalSteps={5} />
                            <StepIndicator label="Features" stepIndex={3} active={cloningProgress >= 35 && cloningProgress < 60} completed={cloningProgress >= 60} totalSteps={5} />
                            <StepIndicator label="Training" stepIndex={4} active={cloningProgress >= 60 && cloningProgress < 90} completed={cloningProgress >= 90} totalSteps={5} />
                            <StepIndicator label="Finalize" stepIndex={5} active={cloningProgress >= 90} completed={cloningProgress >= 100} totalSteps={5} />
                        </div>
                        <ProgressVisualizer 
                            isActive={isCloning} 
                            label="" 
                            description={cloningStatusMessage} 
                            progress={cloningProgress} 
                            timeRemaining={cloningTimeRemaining}
                        />
                    </div>
                )}
                
                {serverError && !isCloning && (
                    <div className="mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-center animate-fade-in shadow-xl font-mono">
                        <h4 className="font-bold text-danger">Cloning Failed</h4>
                        <p className="text-sm text-danger mt-1">{serverError}</p>
                    </div>
                )}

                <button onClick={handleCloneClick} disabled={!isFormValid || isAppBusy || isCloning} className="w-full bg-accent hover:bg-accent-dim disabled:bg-carbon-base disabled:cursor-not-allowed text-carbon-base font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-glow-accent font-mono hover:scale-[1.01] active:scale-[0.99]">
                    {isCloning ? 'PROCESSING...' : 'CLONE VOICE'}
                </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-tension-line/30 shrink-0">
                <h3 className="text-lg font-bold mb-3 text-text-main font-sans neon-text">Import Voice</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                        <TextInput id="import-url" label="Import from URL" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://..." disabled={isAppBusy} error={errors.importUrl} />
                    </div>
                    <button onClick={handleImportClick} disabled={isAppBusy || !importUrl} className="mt-6 bg-carbon-base hover:bg-carbon-weave disabled:opacity-50 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors h-10 border border-tension-line/30 shadow-sm font-mono hover:border-accent hover:text-accent">IMPORT</button>
                </div>
            </div>
        </div>

        <div className="tension-panel rounded-xl flex flex-col h-auto lg:h-full lg:overflow-y-auto custom-scrollbar border border-tension-line/30 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-text-main font-sans shrink-0 neon-text">Voice Library</h3>
            
            <div className="space-y-3 mb-4 shrink-0">
                <TextInput id="search-voices" label="Search Voices" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name..." disabled={false} />
                <div className="flex gap-2">
                    <Selector id="filter-status" label="Status" value={filterStatus} options={VOICE_STATUSES} onChange={(val) => setFilterStatus(val as VoiceStatus | 'all')} disabled={false} />
                    <Selector id="filter-priority" label="Priority" value={filterPriority} options={VOICE_PRIORITIES} onChange={(val) => setFilterPriority(val as VoicePriority | 'all')} disabled={false} />
                </div>
            </div>

            <div className="flex-grow lg:overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {filteredVoices.length === 0 ? (
                    <div className="text-center text-text-dim text-sm py-10 italic font-mono">
                        {clonedVoices.length === 0 ? "No cloned voices yet. Create one to get started." : "No voices match your filters."}
                    </div>
                ) : (
                    filteredVoices.map((voice, idx) => (
                        <div key={idx} className={`bg-carbon-base/50 p-4 rounded-xl border transition-all group relative overflow-hidden flex flex-col gap-3 ${voice.status === 'Processing' ? 'border-accent-dim shadow-[0_0_15px_rgba(45,212,191,0.1)]' : 'border-tension-line/30 hover:border-accent-dim hover:shadow-glow-accent'}`}>
                            
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner border border-white/10 ${
                                        voice.status === 'Processing' ? 'bg-carbon-weave animate-pulse' :
                                        voice.gender === 'Female' ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_5px_var(--pink-400)]' : 
                                        voice.gender === 'Male' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_5px_var(--blue-400)]' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {voice.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-main text-sm font-sans neon-text">{voice.name}</h4>
                                        <p className="text-[10px] text-text-dim font-mono">{voice.baseVoice} Base</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                    {voice.status === 'Processing' && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-bold uppercase font-mono animate-pulse flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping"></span> Processing
                                        </span>
                                    )}
                                    {voice.status === 'Failed' && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 font-bold uppercase font-mono flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-danger rounded-full"></span> Failed
                                        </span>
                                    )}
                                    {voice.status === 'Ready' && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-bold uppercase font-mono flex items-center gap-1 shadow-[0_0_5px_var(--success-dim)]">
                                            <span className="w-1.5 h-1.5 bg-success rounded-full"></span> Ready
                                        </span>
                                    )}
                                    <span className="text-[9px] text-text-dim font-mono opacity-60">{voice.createdAt}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                <span className="bg-carbon-weave/50 px-2 py-1 rounded text-text-dim border border-white/5">{voice.accent} Accent</span>
                                <span className="bg-carbon-weave/50 px-2 py-1 rounded text-text-dim border border-white/5">{voice.tone} Tone</span>
                                {voice.rating !== undefined && (
                                    <span className={`px-2 py-1 rounded border border-white/5 flex items-center gap-1 ${
                                        voice.rating > 80 ? 'bg-success/5 text-success' : 'bg-yellow-500/5 text-yellow-500'
                                    }`}>
                                        Quality: {voice.rating}
                                    </span>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {voice.status === 'Ready' && (
                                <div className="mt-1 pt-3 border-t border-white/5 flex justify-between items-center">
                                    <button className="text-[10px] bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded flex items-center gap-2 font-bold font-mono transition-colors shadow-glow-accent">
                                        <PlayIcon /> PREVIEW VOICE
                                    </button>
                                </div>
                            )}
                            
                            {voice.status === 'Failed' && (
                                <div className="mt-1 pt-3 border-t border-white/5 flex justify-end">
                                    <button 
                                        onClick={() => handleRetry(voice)} 
                                        className="text-[10px] bg-carbon-weave text-text-main hover:bg-white/10 px-3 py-1.5 rounded flex items-center gap-2 font-bold font-mono transition-colors"
                                    >
                                        <RetryIcon /> RETRY CLONING
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default CloneVoiceForm;
