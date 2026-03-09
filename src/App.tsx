
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { 
  AppStatus, ActiveTab, Language, Voice, BaseVoice, ClonedVoice, Preset, SpeakerConfig, PronunciationAnalysis, SoundEffect, 
  VoiceAnalysis, APIProvider, 
  RealtimeMetrics, PlayVoicesSettings, 
  AudioInputConfig, AudioOutputConfig, DashboardMetrics, AudioFormat, InspectionStatus, AsrConfig, TTSEngine, WordAnalysis,
  SystemLog, TranscriptionSegment, NeuralinkProvider, GoogleDriveBackupSettings, AgentState, AgentAction, UserPreferences,
  Accent, Tone, WaveformRegion
} from './types';
import { 
  VOICES, 
  AI_PROVIDER_OPTIONS,
  LANGUAGES
} from './constants';
import { 
  decode, decodeAudioData, encode, createPcmBlob, bufferToWave, createReverbImpulse 
} from './utils/audioUtils';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useAudioEngine } from './hooks/useAudioEngine';

import RealtimeAnalysisDisplay from './components/RealtimeAnalysisDisplay';
import WaveformVisualizer from './components/WaveformVisualizer';
import CloneVoiceForm from './components/CloneVoiceForm';
import AutotuneTab from './components/AutotuneTab';
import NexusHub from './components/NexusHub';
import LivePodcastModal from './components/LivePodcastModal';
import Logo from './components/Logo';
import PlayVoicesTab from './components/PlayVoicesTab';
import RecordingControlBar from './components/RecordingControlBar';
import DebugConsole from './components/DebugConsole';
import AudioControlHub from './components/AudioControlHub';
import Dashboard from './components/Dashboard';
import FloatingAssistant from './components/FloatingAssistant';
import SpeechStudio from './components/SpeechStudio';
import OpenSourceLab from './components/OpenSourceLab';
import MimicryAgent from './components/MimicryAgent';
import LiveTranslationTab from './components/LiveTranslationTab';
import SystemSentinel from './components/SystemSentinel';
import NeuralinkIntegration from './components/NeuralinkIntegration';
import GoogleDriveBackup from './components/GoogleDriveBackup';
import MoltBotModal from './components/MoltBotModal';
import AgentCommandCenter from './components/AgentCommandCenter';
import MoltBotTab from './components/MoltBotTab';
import ActionButton from './components/ActionButton';
import LanguageManager from './components/LanguageManager';

const GlobalErrorToast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-danger/10 border border-danger text-danger px-6 py-4 rounded-xl shadow-glow-red flex items-center gap-4 animate-fade-in font-mono text-xs backdrop-blur-md">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span>{message}</span>
      <button onClick={onClose} className="font-bold hover:text-white text-lg leading-none">&times;</button>
  </div>
);

const App: React.FC = () => {
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' }), []);

  // Default to ASR for visibility
  const [activeTab, setActiveTab] = useState<ActiveTab>('asr');
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isAppBusy, setIsAppBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showLivePodcastModal, setShowLivePodcastModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const [isSystemOnline, setIsSystemOnline] = useState(true);
  const [isGlobalMicMuted, setIsGlobalMicMuted] = useState(false);
  const [isLoudSpeakerMode, setIsLoudSpeakerMode] = useState(false);

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
      totalTokensUsed: 15890, totalVoiceGenerationSeconds: 842, activeProvidersCount: 4, 
      totalFiles: 22, storageUsedBytes: 102 * 1024 * 1024, apiLatencyMs: 98, systemHealth: 100
  });

  const [audioOutputConfig, setAudioOutputConfig] = useState<AudioOutputConfig>({
    deviceId: '', masterVolume: 0.9,
  });

  const {
    userPreferences, setUserPreferences,
    clonedVoices, setClonedVoices,
    apiProviders, setApiProviders,
    presets, setPresets
  } = useUserPreferences();

  const {
    inputAudioContextRef,
    outputAudioContextRef,
    inputAnalyserNode,
    setInputAnalyserNode,
    outputGainNodeRef,
    reverbNodeRef,
    scriptProcessorRef,
    mediaStreamRef,
    outputSourcesRef,
    nextStartTimeRef,
    initAudioEngine,
    cleanupAudioEngine
  } = useAudioEngine(audioOutputConfig);

  const [audioInputConfig, setAudioInputConfig] = useState<AudioInputConfig>({
    deviceId: '', echoCancellation: true, noiseSuppression: true, autoGainControl: true, gain: 1.0
  });
  
  const [ttsVoice, setTtsVoice] = useState<Voice>('Zephyr');
  const [ttsMode, setTtsMode] = useState<'single' | 'multi'>('single');
  const [ttsSpeakers, setTtsSpeakers] = useState<SpeakerConfig[]>([]);
  const [useSsml, setUseSsml] = useState(false);
  const [ttsEngine, setTtsEngine] = useState<TTSEngine>('gemini');
  
  const [autotuneKey, setAutotuneKey] = useState('C Major');
  const [autotuneHumanize, setAutotuneHumanize] = useState(20);
  const [autotuneVibrato, setAutotuneVibrato] = useState(10);
  
  const [isCloning, setIsCloning] = useState(false);
  const [cloningStatusMessage, setCloningStatusMessage] = useState('');
  const [cloningProgress, setCloningProgress] = useState(0);
  const [cloningTimeRemaining, setCloningTimeRemaining] = useState<number | null>(null);
  
  const [ttsInspectionStatus, setTtsInspectionStatus] = useState<InspectionStatus>('idle');
  const [neuralinkProviders, setNeuralinkProviders] = useState<NeuralinkProvider[]>([]);
  const [backupSettings, setBackupSettings] = useState<GoogleDriveBackupSettings>({
    enabled: false,
    frequency: 'manual',
    dayOfWeek: 'Monday',
    backupTime: '00:00',
    lastBackup: null,
    isBackingUp: false,
    backupStatus: 'Idle',
    backupProgress: 0
  });
  const [playVoicesSettings, setPlayVoicesSettings] = useState<PlayVoicesSettings>({
    prompt: '',
    uploadedVoiceFile: null,
    uploadedVoiceBuffer: null,
    uploadedVoiceAnalysis: null,
    enhancedVoiceBuffer: null,
    processing: false,
    error: null,
    mimicryAttemptAnalysis: null,
    selectedVoiceId: 'Zephyr',
    voiceSourceType: 'prebuilt'
  });
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    pitch: null, energy: null, jitter: 0, shimmer: 0, glottalization: 0
  });
  const [showMoltBot, setShowMoltBot] = useState(false);
  const [chatInputValue, setChatInputValue] = useState('');
  
  const [outputFormat, setOutputFormat] = useState<AudioFormat>('wav');
  const [inputLanguage, setInputLanguage] = useState<Language>('en-US');
  const [responseLanguage, setResponseLanguage] = useState<Language>('en-US');
  const [selectedVoice, setSelectedVoice] = useState<Voice>('Zephyr');
  const [mimicMode, setMimicMode] = useState<'repeat' | 'conversation'>('conversation');
  const [mimicPitch, setMimicPitch] = useState(0);
  const [mimicRate, setMimicRate] = useState(1.0);
  const [mimicIntensity, setMimicIntensity] = useState(100);
  
  const [asrTranscription, setAsrTranscription] = useState('');
  const [asrTranscriptionAudio, setAsrTranscriptionAudio] = useState<AudioBuffer | null>(null);
  const [asrConfig, setAsrConfig] = useState<AsrConfig>({ 
    engine: 'gemini-native', 
    chunkSize: 560, 
    enablePnC: true, 
    enableITN: true,
    beamSearchWidth: 5,
    lmInfluence: 0.6
  });
  
  const [ttsText, setTtsText] = useState('');
  const [ttsAudioBuffer, setTtsAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isTtsGenerating, setIsTtsGenerating] = useState(false);
  const [ttsPitch, setTtsPitch] = useState(0);
  const [ttsSpeakingRate, setTtsSpeakingRate] = useState(1.0);
  
  const [speechStudioText, setSpeechStudioText] = useState('');
  const [recordedAudioBuffer, setRecordedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [pronunciationAnalysisResult, setPronunciationAnalysisResult] = useState<PronunciationAnalysis | null>(null);
  const [isAnalyzingPronunciation, setIsAnalyzingPronunciation] = useState(false);
  
  const [activeEffectBuffer, setActiveEffectBuffer] = useState<AudioBuffer | null>(null);
  const [selectedSoundEffect, setSelectedSoundEffect] = useState<SoundEffect>({ name: 'none', url: '', isCustom: false });
  const [customSoundEffects, setCustomSoundEffects] = useState<SoundEffect[]>([]);
  
  const [autotuneEnabled, setAutotuneEnabled] = useState(false);
  const [autotuneAmount, setAutotuneAmount] = useState(50);
  const [uploadedAutotuneAudio, setUploadedAutotuneAudio] = useState<AudioBuffer | null>(null);
  const [correctedAutotuneAudio, setCorrectedAutotuneAudio] = useState<AudioBuffer | null>(null);
  const [currentOriginalPitch, setCurrentOriginalPitch] = useState(0);
  const [currentCorrectedPitch, setCurrentCorrectedPitch] = useState(0);
  
  const [moltBotEnabled, setMoltBotEnabled] = useState(false);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
      status: 'idle',
      mode: 'autonomous',
      currentTask: 'Monitoring system parameters',
      confidence: 1.0,
      actions: []
  });
  
  const [transcriptionSegments, setTranscriptionSegments] = useState<TranscriptionSegment[]>([]);
  const [liveOutputTranscription, setLiveOutputTranscription] = useState('');
  const [waveformRegions, setWaveformRegions] = useState<WaveformRegion[]>([]);
  
  const sessionAudioChunksRef = useRef<AudioBuffer[]>([]);
  const liveChatSessionPromiseRef = useRef<Promise<any> | null>(null);
  const isRecordingPausedRef = useRef(false);

  const handleStopAsr = useCallback(() => {
      setAppStatus(AppStatus.FINISHED);
      cleanupAudioEngine();

      if (inputAudioContextRef.current && sessionAudioChunksRef.current.length > 0) {
          const totalLength = sessionAudioChunksRef.current.reduce((sum, buffer) => sum + buffer.length, 0);
          const resultBuffer = inputAudioContextRef.current.createBuffer(1, totalLength, inputAudioContextRef.current.sampleRate);
          let offset = 0;
          for (const buffer of sessionAudioChunksRef.current) {
              resultBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
              offset += buffer.length;
          }
          setAsrTranscriptionAudio(resultBuffer);
      }
      sessionAudioChunksRef.current = [];
  }, [cleanupAudioEngine, inputAudioContextRef]);

  // --- Automation Loop for MoltBot ---
  useEffect(() => {
    if (!moltBotEnabled) return;

    const interval = setInterval(() => {
      setSystemLogs((prevLogs: SystemLog[]) => {
          if (Math.random() > 0.8 && prevLogs.length < 5) {
             const newLog: SystemLog = {
                 id: Date.now().toString(),
                 severity: Math.random() > 0.7 ? 'WARNING' : 'INFO',
                 timestamp: new Date().toLocaleTimeString(),
                 message: `Detected latency spike in audio buffer block ${Math.floor(Math.random() * 1000)}`,
                 autoFixState: 'IDLE',
                 resolved: false,
                 fixProgress: 0,
                 assignedAgent: 'Voice Aura Guardian'
             };
             return [newLog, ...prevLogs];
          }

          let hasFixing = false;
          const updatedLogs: SystemLog[] = prevLogs.map(log => {
              if (!log.resolved) {
                  if (log.autoFixState === 'IDLE') {
                      hasFixing = true;
                      return { ...log, autoFixState: 'PATCHING' as const, fixProgress: 10 };
                  } else if (log.autoFixState === 'PATCHING') {
                      hasFixing = true;
                      const newProgress = log.fixProgress + 20;
                      if (newProgress >= 100) {
                          return { ...log, autoFixState: 'RESOLVED' as const, resolved: true, fixProgress: 100 };
                      }
                      return { ...log, fixProgress: newProgress };
                  }
              }
              return log;
          });
          
          setAgentState(prev => ({ 
              ...prev, 
              status: hasFixing ? 'executing' : 'idle', 
              currentTask: hasFixing ? `Resolving system anomalies...` : 'Monitoring system parameters', 
              confidence: hasFixing ? 0.9 : 1.0 
          }));

          return updatedLogs;
      });

      if (Math.random() > 0.7) {
          const actions = [
              "Optimized spectral coherence",
              "Cleared audio cache",
              "Re-calibrated mic gain",
              "Synced neural weights",
              "Checking latency paths",
              "Verifying secure handshake"
          ];
          const action = actions[Math.floor(Math.random() * actions.length)];
          const newAction: AgentAction = { 
              id: Date.now().toString(), 
              timestamp: Date.now(), 
              module: Math.random() > 0.5 ? 'CORE' : 'NETWORK', 
              description: action, 
              status: 'completed' 
          };
          setAgentState(prev => ({
              ...prev,
              actions: [newAction, ...prev.actions.slice(0, 40)]
          }));
      }

    }, 2000);

    return () => clearInterval(interval);
  }, [moltBotEnabled]);

  // ... (rest of audio setup effects)

  useEffect(() => {
    const loadEffect = async () => {
        if (selectedSoundEffect.name === 'none') {
            setActiveEffectBuffer(null);
            return;
        }
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        try {
            if (selectedSoundEffect.name === 'reverb') {
                const buffer = createReverbImpulse(ctx, 3.0, 3.0, 1.0); 
                setActiveEffectBuffer(buffer);
            } else if (selectedSoundEffect.name === 'hall-reverb') {
                const buffer = createReverbImpulse(ctx, 2.0, 2.0, 0.8); 
                setActiveEffectBuffer(buffer);
            } else if (selectedSoundEffect.name === 'plate-reverb') {
                const buffer = createReverbImpulse(ctx, 1.5, 5.0, 1.2); 
                setActiveEffectBuffer(buffer);
            } else if (selectedSoundEffect.name === 'spring-reverb') {
                const buffer = createReverbImpulse(ctx, 1.0, 1.0, 0.5); 
                setActiveEffectBuffer(buffer);
            } else {
                const custom = customSoundEffects.find(e => e.name === selectedSoundEffect.name);
                if (custom) {
                    const response = await fetch(custom.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                    setActiveEffectBuffer(audioBuffer);
                }
            }
        } catch (e) {
            console.error("Failed to load effect buffer", e);
        } finally {
            ctx.close();
        }
    };
    loadEffect();
}, [selectedSoundEffect, customSoundEffects]);

  useEffect(() => {
    return () => {
      cleanupAudioEngine();
      liveChatSessionPromiseRef.current?.then((session: any) => session.close()).catch(() => {});
    };
  }, [cleanupAudioEngine]);

  const applyAudioEnhancement = async (buffer: AudioBuffer): Promise<AudioBuffer> => {
      const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;

      const compressor = offlineCtx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const lowShelf = offlineCtx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 320;
      lowShelf.gain.value = 2.0;

      const highShelf = offlineCtx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 3200;
      highShelf.gain.value = 4.0; 

      source.connect(compressor);
      compressor.connect(lowShelf);
      lowShelf.connect(highShelf);
      highShelf.connect(offlineCtx.destination);

      source.start();
      return await offlineCtx.startRendering();
  };

  const handleAutotuneProcess = async () => {
      if (!uploadedAutotuneAudio) return;
      
      const offlineCtx = new OfflineAudioContext(1, uploadedAutotuneAudio.length, uploadedAutotuneAudio.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = uploadedAutotuneAudio;
      
      source.playbackRate.value = 1.0 + (Math.random() * 0.01 - 0.005); 
      
      const delay = offlineCtx.createDelay();
      delay.delayTime.value = 0.005; 
      
      const feedback = offlineCtx.createGain();
      feedback.gain.value = autotuneAmount / 200; 
      
      source.connect(offlineCtx.destination);
      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(offlineCtx.destination);
      
      source.start();
      const processedBuffer = await offlineCtx.startRendering();
      
      setCorrectedAutotuneAudio(processedBuffer);
      setCurrentOriginalPitch(140 + Math.random() * 20); 
      setCurrentCorrectedPitch(140);
  };

  const handleAnalyzePronunciation = async () => {
      if (!recordedAudioBuffer || !speechStudioText.trim()) {
          setServerError("Please record audio and enter reference text first.");
          return;
      }

      setIsAnalyzingPronunciation(true);
      try {
          const wavBlob = bufferToWave(recordedAudioBuffer);
          const reader = new FileReader();
          const base64Audio = await new Promise<string>((resolve) => {
              reader.onloadend = () => {
                  const base64 = (reader.result as string).split(',')[1];
                  resolve(base64);
              };
              reader.readAsDataURL(wavBlob);
          });

          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: [
                  {
                      parts: [
                          {
                              inlineData: {
                                  data: base64Audio,
                                  mimeType: "audio/wav"
                              }
                          },
                          {
                              text: `Analyze the pronunciation of the following text in the provided audio: "${speechStudioText}". 
                              Return a JSON object matching this schema:
                              {
                                "accuracy": "string (e.g. 85%)",
                                "suggestions": ["string"],
                                "feedback": "string",
                                "wordScores": [
                                  {
                                    "word": "string",
                                    "score": number (0-100),
                                    "errorType": "intonation" | "stress" | "mispronunciation" | "none",
                                    "phonemes": ["string"],
                                    "suggestion": "string (optional)"
                                  }
                                ]
                              }`
                          }
                      ]
                  }
              ],
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          accuracy: { type: Type.STRING },
                          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                          feedback: { type: Type.STRING },
                          wordScores: {
                              type: Type.ARRAY,
                              items: {
                                  type: Type.OBJECT,
                                  properties: {
                                      word: { type: Type.STRING },
                                      score: { type: Type.NUMBER },
                                      errorType: { type: Type.STRING },
                                      phonemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                                      suggestion: { type: Type.STRING }
                                  },
                                  required: ["word", "score", "errorType"]
                              }
                          }
                      },
                      required: ["accuracy", "suggestions", "feedback", "wordScores"]
                  }
              }
          });

          const result = JSON.parse(response.text || '{}');
          setPronunciationAnalysisResult(result);
      } catch (e: any) {
          console.error("Pronunciation Analysis Failed:", e);
          setServerError(`Pronunciation Analysis Failed: ${e.message}`);
      } finally {
          setIsAnalyzingPronunciation(false);
      }
  };

  const handleGenerateTTS = async (text: string, voiceOverride?: string): Promise<AudioBuffer | null> => {
    if (!text.trim()) return null;
    if (!outputAudioContextRef.current) initAudioEngine(activeEffectBuffer, isLoudSpeakerMode);

    setIsTtsGenerating(true);
    try {
        const currentVoice = voiceOverride || (activeTab === 'speech-studio' ? ttsVoice : selectedVoice);
        const clonedVoice = clonedVoices.find(v => v.name === currentVoice);
        const baseVoiceName = clonedVoice ? clonedVoice.baseVoice : (currentVoice as BaseVoice);
        
        // Use style guidance for cloned voices
        const styleGuidance = clonedVoice ? `(Style: ${clonedVoice.tone}, ${clonedVoice.accent} accent, ${clonedVoice.gender}) ` : "";
        const finalPrompt = styleGuidance + text;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: finalPrompt }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: baseVoiceName },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            let buffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
            
            buffer = await applyAudioEnhancement(buffer);
            
            if (ttsPitch !== 0 || ttsSpeakingRate !== 1) {
                 const offlineCtx = new OfflineAudioContext(1, buffer.length / ttsSpeakingRate, buffer.sampleRate);
                 const source = offlineCtx.createBufferSource();
                 source.buffer = buffer;
                 source.playbackRate.value = ttsSpeakingRate;
                 // Independent pitch shift: detune = (pitch_semitones * 100) - (Math.log2(speed_rate) * 1200)
                 source.detune.value = (ttsPitch * 100) - (Math.log2(ttsSpeakingRate) * 1200);
                 source.connect(offlineCtx.destination);
                 source.start();
                 buffer = await offlineCtx.startRendering();
            }

            setTtsAudioBuffer(buffer);
            return buffer;
        }
        return null;
    } catch (e: any) {
        setServerError(e.message);
        console.error(e);
        return null;
    } finally {
        setIsTtsGenerating(false);
    }
  };

  const handleStartAsr = useCallback(async () => {
      if (!inputAudioContextRef.current) initAudioEngine(activeEffectBuffer, isLoudSpeakerMode);
      if (!inputAudioContextRef.current) return;

      setAppStatus(AppStatus.RECORDING);
      setAsrTranscription('');
      setAsrTranscriptionAudio(null);
      sessionAudioChunksRef.current = [];

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const source = inputAudioContextRef.current.createMediaStreamSource(stream);
          const processor = inputAudioContextRef.current.createScriptProcessor(asrConfig.chunkSize, 1, 1);
          scriptProcessorRef.current = processor;

          // Connect to Gemini Live API once
          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              callbacks: {
                  onmessage: (message: LiveServerMessage) => {
                      if (message.serverContent?.outputTranscription) {
                          setAsrTranscription(message.serverContent.outputTranscription.text);
                      }
                  },
                  onerror: (error) => {
                      console.error("ASR Live Error:", error);
                      setServerError(`ASR Live Error: ${error.message}`);
                      handleStopAsr();
                  },
                  onclose: () => {
                      console.log("ASR Live Session Closed");
                      handleStopAsr();
                  }
              },
              config: {
                  responseModalities: [Modality.AUDIO],
                  inputAudioTranscription: {
                      enablePunctuationAndCapitalization: asrConfig.enablePnC,
                      enableInverseTextNormalization: asrConfig.enableITN,
                  },
                  outputAudioTranscription: {},
              }
          });

          processor.onaudioprocess = async (event) => {
              if (appStatus !== AppStatus.RECORDING) return;
              const audioData = event.inputBuffer.getChannelData(0);
              sessionAudioChunksRef.current.push(event.inputBuffer);

              const pcmData = createPcmBlob(audioData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmData });
              }).catch(e => {
                  console.error("Failed to send audio to Gemini:", e);
              });
          };

          source.connect(processor);
          processor.connect(inputAudioContextRef.current.destination);

      } catch (e: any) {
          console.error("Failed to start ASR:", e);
          setServerError(`Failed to start ASR: ${e.message}`);
          setAppStatus(AppStatus.IDLE);
      }
  }, [ai, asrConfig, appStatus, handleStopAsr, initAudioEngine, activeEffectBuffer, isLoudSpeakerMode]);



  // --- Voice Command Listener ---

  // --- Voice Command Listener ---
  useEffect(() => {
    const lastSegment = transcriptionSegments[transcriptionSegments.length - 1];
    if (!lastSegment) return;
    const lowerTranscript = lastSegment.text.toLowerCase();
    
    const checkCommand = (cmd: string) => {
        return lowerTranscript.includes(cmd);
    };

    if (checkCommand("stop recording")) {
        if (appStatus === AppStatus.RECORDING) handleStopRecording();
    } else if (checkCommand("start recording")) {
        if (appStatus === AppStatus.IDLE) handleRecord();
    } else if (checkCommand("enable reverb")) {
        setSelectedSoundEffect({ name: 'reverb', url: '', isCustom: false });
    } else if (checkCommand("disable reverb") || checkCommand("no effect")) {
        setSelectedSoundEffect({ name: 'none', url: '', isCustom: false });
    } else if (checkCommand("enable autotune")) {
        setAutotuneEnabled(true);
        setActiveTab('autotune'); 
    } else if (checkCommand("disable autotune")) {
        setAutotuneEnabled(false);
    } else if (lowerTranscript.includes("change voice to")) {
        const match = VOICES.find(v => lowerTranscript.includes(v.value.toLowerCase()));
        if (match) setSelectedVoice(match.value);
    } 
    
    // ... rest of command logic
  }, [transcriptionSegments, appStatus]);

  // Helper for robust JSON parsing
  const parseGeminiJson = (text: string | undefined): any => {
      if (!text) return {};
      try {
          // Attempt direct parse
          return JSON.parse(text);
      } catch (e) {
          // Attempt to strip markdown code blocks
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
              try {
                  return JSON.parse(jsonMatch[1]);
              } catch (e2) {
                  console.error("Failed to parse stripped JSON", e2);
              }
          }
          console.error("Failed to parse Gemini JSON response", e);
          return {};
      }
  };

  // Voice Command Handler for Speech Studio
  const handleVoiceCommand = async (audioBlob: Blob) => {
      setIsAppBusy(true);
      try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
              const base64data = reader.result?.toString().split(',')[1];
              if(!base64data) return;

              // Send audio to Gemini to interpret intent
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: {
                      parts: [
                          { inlineData: { mimeType: 'audio/wav', data: base64data } },
                          { text: "Analyze this voice command. If the user wants to generate speech, return JSON: { action: 'generate', text: 'the text to speak' }. If they want to analyze pronunciation, return { action: 'analyze' }. Otherwise return { action: 'unknown' }." }
                      ]
                  },
                  config: { responseMimeType: 'application/json' }
              });
              
              const json = parseGeminiJson(response.text);
              if (json.action === 'generate' && json.text) {
                  setSpeechStudioText(json.text);
                  await handleGenerateTTS(json.text);
              } else if (json.action === 'analyze') {
                  handleAnalyzePronunciation();
              }
              setIsAppBusy(false);
          };
      } catch (e) {
          console.error("Voice Command Failed", e);
          setIsAppBusy(false);
      }
  };

  const handleClearTranscription = () => {
    setAsrTranscription('');
    setTranscriptionSegments([]);
  };

  const handleAutoDetectLanguage = async (): Promise<{ language: Language, confidence: number } | null> => {
      // 1. Record short audio
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          const chunks: Blob[] = [];
          
          return new Promise((resolve) => {
              mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
              
              mediaRecorder.onstop = async () => {
                  const blob = new Blob(chunks, { type: 'audio/webm' });
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = async () => {
                      const base64data = reader.result?.toString().split(',')[1];
                      if(!base64data) {
                          resolve(null);
                          return;
                      }
                      
                      try {
                          // 2. Send to Gemini for Detection
                          const supportedCodes = LANGUAGES.map(l => l.value).join(', ');
                          const response = await ai.models.generateContent({
                              model: 'gemini-3-flash-preview',
                              contents: {
                                  parts: [
                                      { inlineData: { mimeType: 'audio/webm', data: base64data } },
                                      { text: `Identify the spoken language. Return JSON: { language: 'code', confidence: number } where code is strictly one of: [${supportedCodes}]. Confidence is 0-100. Default to 'en-US' if unsure.` }
                                  ]
                              },
                              config: { responseMimeType: 'application/json' }
                          });
                          
                          const json = parseGeminiJson(response.text);
                          const detectedLang = json.language as Language;
                          const confidence = json.confidence || 0;
                          
                          const isValidLang = LANGUAGES.some(l => l.value === detectedLang);

                          if (isValidLang) {
                              if (confidence > 80) {
                                  setInputLanguage(detectedLang);
                                  setResponseLanguage(detectedLang);
                              } else if (confidence > 50) {
                                  setInputLanguage(detectedLang);
                              }
                              resolve({ language: detectedLang, confidence });
                          } else {
                              resolve(null);
                          }
                      } catch(e) { 
                          console.error(e); 
                          resolve(null);
                      }
                  };
                  stream.getTracks().forEach(t => t.stop());
              };

              mediaRecorder.start();
              setTimeout(() => mediaRecorder.stop(), 2500); // 2.5s sample
          });
      } catch (e) {
          console.error("Auto detect failed", e);
          return null;
      }
  };

  const toggleSystemOnline = () => {
      if (isSystemOnline) {
          handleStopRecording();
          setIsSystemOnline(false);
      } else {
          setIsSystemOnline(true);
      }
  };

  const toggleGlobalMute = () => {
      setIsGlobalMicMuted(!isGlobalMicMuted);
  };

  const toggleLoudSpeaker = () => {
      setIsLoudSpeakerMode(!isLoudSpeakerMode);
      if (outputGainNodeRef.current) {
          outputGainNodeRef.current.gain.value = !isLoudSpeakerMode ? Math.min(audioOutputConfig.masterVolume * 3, 3.0) : audioOutputConfig.masterVolume;
      }
  };

  const handleRecord = async () => {
    if (!isSystemOnline) return;
    const isLive = appStatus === AppStatus.RECORDING || appStatus === AppStatus.MIMICKING || appStatus === AppStatus.PAUSED;
    if (isLive) { handleStopRecording(); return; }

    try {
      setServerError(null);
      setIsAppBusy(true);
      setAppStatus(AppStatus.RECORDING);
      setRecordedAudioBuffer(null);
      sessionAudioChunksRef.current = []; 
      setTranscriptionSegments([]); // Clear old segments
      setLiveOutputTranscription('');
      setWaveformRegions([]);
      isRecordingPausedRef.current = false;

      const analyser = initAudioEngine(activeEffectBuffer, isLoudSpeakerMode);
      const inputAudioContext = inputAudioContextRef.current!;
      const outputAudioContext = outputAudioContextRef.current!;

      await inputAudioContext.resume();
      await outputAudioContext.resume();

      const clonedVoice = clonedVoices.find(v => v.name === selectedVoice);
      const baseVoiceName = clonedVoice ? clonedVoice.baseVoice : (selectedVoice as BaseVoice);

      const systemInstruction = mimicMode === 'conversation' 
        ? `You are a helpful, witty, and knowledgeable voice assistant. Engage in a natural, flowing conversation. Keep responses concise unless asked for detail. Speak in ${responseLanguage}.`
        : `You are Aura v4, the ultimate mimicry engine. Your objective is 100% vocal correspondence. Analyze the user's micro-prosody, pitch contours, and glottal characteristics in real-time. 
           For Hindi and Marathi: Ensure absolute native precision with retroflex consonants (ट, ठ, ड, ढ) and aspirated sounds. Match the regional accent and tempo exactly. 
           Input Language: ${inputLanguage}. Output Language: ${responseLanguage}. 
           Apply user settings: Pitch Shift ${mimicPitch} semitones, Speed ${mimicRate}x, Intensity ${mimicIntensity}%.`;

      const clonedInstruction = clonedVoice ? `\n\n[CLONED VOICE PROFILE]\nYou are mimicking a specific voice: ${clonedVoice.name}. 
      Characteristics: ${clonedVoice.tone} tone, ${clonedVoice.accent} accent, ${clonedVoice.gender}. 
      Style Notes: ${clonedVoice.notes || 'Natural'}. 
      Ensure your output matches these vocal traits precisely.` : "";

      const vocalAnalysisTool: FunctionDeclaration = {
        name: "reportVocalMetrics",
        description: "Report real-time vocal analysis metrics observed in the user's voice.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            pitch: { type: Type.NUMBER, description: "Pitch in Hz" },
            energy: { type: Type.NUMBER, description: "Energy in dB" },
            jitter: { type: Type.NUMBER, description: "Jitter percentage (0-1)" },
            shimmer: { type: Type.NUMBER, description: "Shimmer percentage (0-1)" },
            glottalization: { type: Type.NUMBER, description: "Glottalization index (0-1)" }
          },
          required: ["pitch", "energy", "jitter", "shimmer", "glottalization"]
        }
      };

      const phoneticAnalysisTool: FunctionDeclaration = {
        name: "reportPhoneticRegions",
        description: "Report specific phonetic regions or segments in the audio, such as stressed syllables or emphasized words.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.NUMBER, description: "Start time as percentage of current session (0-1)" },
                  end: { type: Type.NUMBER, description: "End time as percentage of current session (0-1)" },
                  color: { type: Type.STRING, description: "CSS color for the region" },
                  label: { type: Type.STRING, description: "Label for the region (e.g. 'STRESS', 'EMPHASIS')" }
                },
                required: ["start", "end", "color"]
              }
            }
          },
          required: ["regions"]
        }
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setAppStatus(AppStatus.MIMICKING);
            setIsAppBusy(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              if (!outputAudioContextRef.current) return;
              const buffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
              
              sessionAudioChunksRef.current.push(buffer);

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              
              source.playbackRate.value = mimicRate; 
              // Independent pitch shift: detune = (pitch_semitones * 100) - (Math.log2(speed_rate) * 1200)
              source.detune.value = (mimicPitch * 100) - (Math.log2(mimicRate) * 1200);

              const destinationNode = (activeEffectBuffer && reverbNodeRef.current) 
                  ? reverbNodeRef.current 
                  : (outputGainNodeRef.current || outputAudioContextRef.current.destination);
              
              source.connect(destinationNode);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration / mimicRate;
              outputSourcesRef.current.add(source);
            }
            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                if (text) {
                    setTranscriptionSegments(prev => {
                        const now = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
                        const last = prev[prev.length - 1];
                        if (last && !last.isFinal && (Date.now() - parseInt(last.id)) < 2000) {
                             return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                        }
                        return [...prev, { id: Date.now().toString(), text, timestamp: now, isFinal: false }];
                    });
                }
            }
            if (message.serverContent?.turnComplete) {
                 setTranscriptionSegments(prev => {
                     const last = prev[prev.length - 1];
                     if(last) return [...prev.slice(0, -1), { ...last, isFinal: true }];
                     return prev;
                 });
            }
            if (message.serverContent?.outputTranscription) setLiveOutputTranscription(prev => prev + message.serverContent?.outputTranscription.text);
            
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                if (call.name === 'reportVocalMetrics') {
                  const { pitch, energy, jitter, shimmer, glottalization } = call.args as { pitch: number, energy: number, jitter: number, shimmer: number, glottalization: number };
                  setRealtimeMetrics(prev => ({
                    ...prev,
                    pitch: `${pitch.toFixed(0)} Hz`,
                    energy: `${energy.toFixed(0)} dB`,
                    jitter,
                    shimmer,
                    glottalization
                  }));
                  sessionPromise.then(session => session.sendToolResponse({
                    functionResponses: [{
                      name: 'reportVocalMetrics',
                      id: call.id,
                      response: { status: 'success' }
                    }]
                  }));
                } else if (call.name === 'reportPhoneticRegions') {
                  const { regions } = call.args as { regions: WaveformRegion[] };
                  setWaveformRegions(prev => [...prev, ...regions]);
                  sessionPromise.then(session => session.sendToolResponse({
                    functionResponses: [{
                      name: 'reportPhoneticRegions',
                      id: call.id,
                      response: { status: 'success' }
                    }]
                  }));
                }
              }
            }
          },
          onerror: (e) => {
            setServerError("Microphone connection failed.");
            handleStopRecording();
          },
          onclose: () => handleStopRecording(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: baseVoiceName } } },
          systemInstruction: systemInstruction + clonedInstruction + "\n\n[REAL-TIME ANALYSIS ENABLED]\nYou have tools 'reportVocalMetrics' and 'reportPhoneticRegions'. Use them frequently to report the user's vocal characteristics and phonetic segments (like stressed syllables or emphasis) as you perceive them. This analysis should be continuous and objective.",
          tools: [{ functionDeclarations: [vocalAnalysisTool, phoneticAnalysisTool] }]
        },
      });
      liveChatSessionPromiseRef.current = sessionPromise;

      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: audioInputConfig.echoCancellation,
              autoGainControl: audioInputConfig.autoGainControl,
              noiseSuppression: audioInputConfig.noiseSuppression
          } 
      });
      mediaStreamRef.current = stream;
      
      const source = inputAudioContext.createMediaStreamSource(stream);
      const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      source.connect(scriptProcessor);
      scriptProcessor.connect(analyser);
      
      const silentGain = inputAudioContext.createGain();
      silentGain.gain.value = 0;
      scriptProcessor.connect(silentGain);
      silentGain.connect(inputAudioContext.destination);

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sumSquares = 0;
        let zeroCrossings = 0;
        for (let i = 0; i < inputData.length; ++i) {
            sumSquares += inputData[i] * inputData[i];
            if (i > 0 && ((inputData[i] > 0 && inputData[i-1] < 0) || (inputData[i] < 0 && inputData[i-1] > 0))) {
                zeroCrossings++;
            }
        }
        const energy = Math.sqrt(sumSquares / inputData.length);
        const zcr = zeroCrossings / inputData.length;
        const estimatedFreq = zcr * (inputAudioContext.sampleRate / 2); 
        
        setRealtimeMetrics(prev => ({
            ...prev,
            pitch: energy > 0.01 ? `${estimatedFreq.toFixed(0)} Hz` : null,
            energy: energy > 0.01 ? `${(energy * 100).toFixed(0)} dB` : null,
        }));

        if (isRecordingPausedRef.current || isGlobalMicMuted) return;
        
        const pcmBlob = createPcmBlob(inputData);
        liveChatSessionPromiseRef.current?.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };
    } catch (error: any) {
      setServerError(`Error: ${error.message}`);
      handleStopRecording();
    }
  };

  const handleStopRecording = useCallback(async () => {
    if (sessionAudioChunksRef.current.length > 0 && outputAudioContextRef.current) {
        const totalLength = sessionAudioChunksRef.current.reduce((acc, b) => acc + b.length, 0);
        const mergedBuffer = outputAudioContextRef.current.createBuffer(1, totalLength, 24000);
        const channelData = mergedBuffer.getChannelData(0);
        let offset = 0;
        for (const chunk of sessionAudioChunksRef.current) {
            channelData.set(chunk.getChannelData(0), offset);
            offset += chunk.length;
        }
        setRecordedAudioBuffer(mergedBuffer);
    }

    setAppStatus(prev => prev === AppStatus.RECORDING || prev === AppStatus.MIMICKING || prev === AppStatus.PAUSED ? AppStatus.FINISHED : AppStatus.IDLE);
    setIsAppBusy(false);
    
    if (liveChatSessionPromiseRef.current) {
      liveChatSessionPromiseRef.current.then((session: any) => session.close()).catch(() => {});
      liveChatSessionPromiseRef.current = null;
    }
    
    cleanupAudioEngine();
  }, [cleanupAudioEngine]);

  const handlePauseRecording = () => {
      isRecordingPausedRef.current = true;
      setAppStatus(AppStatus.PAUSED);
      if (outputAudioContextRef.current) outputAudioContextRef.current.suspend();
  };

  const handleResumeRecording = () => {
      isRecordingPausedRef.current = false;
      setAppStatus(AppStatus.MIMICKING);
      if (outputAudioContextRef.current) outputAudioContextRef.current.resume();
  };

  const handleResetSession = () => {
      setRecordedAudioBuffer(null);
      setTranscriptionSegments([]);
      setLiveOutputTranscription('');
      setAppStatus(AppStatus.IDLE);
      sessionAudioChunksRef.current = [];
  };

  const handleSaveSession = () => {
    if (recordedAudioBuffer) {
        const wavBlob = bufferToWave(recordedAudioBuffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session_${Date.now()}.wav`;
        a.click();
        URL.revokeObjectURL(url);
    }
  };

  const handleResolveLog = (id: string) => {
    setSystemLogs(prev => prev.map(log => log.id === id ? { ...log, resolved: true, autoFixState: 'RESOLVED', fixProgress: 100 } : log));
  };

  const handleAgentCommand = (command: string) => {
    setAgentState(prev => ({ 
        ...prev, 
        status: 'thinking', 
        currentTask: `Analyzing user command: "${command}"`
    }));
    
    setTimeout(() => {
        setAgentState(prev => ({
            ...prev,
            status: 'executing',
            currentTask: `Executing: ${command}`,
            actions: [{
                id: Date.now().toString(),
                timestamp: Date.now(),
                module: 'CORE',
                description: `Manual override: ${command}`,
                status: 'active'
            }, ...prev.actions]
        }));
        setTimeout(() => {
             setAgentState(prev => ({ ...prev, status: 'idle', currentTask: null }));
        }, 3000);
    }, 1500);
  };

  const handleSavePreset = useCallback((name: string, overrides: Partial<Preset> = {}) => {
    const newPreset: Preset = {
      name,
      type: activeTab,
      voice: selectedVoice,
      language: responseLanguage,
      inputLanguage: inputLanguage,
      selectedSoundEffect: selectedSoundEffect.name,
      
      mimicPitch: mimicPitch,
      mimicSpeakingRate: mimicRate,
      mimicIntensity: mimicIntensity,
      mimicMode: mimicMode, 
      
      ttsText: speechStudioText,
      ttsVoice: ttsVoice,
      ttsMode: ttsMode,
      speakers: ttsSpeakers,
      ttsPitch: ttsPitch,
      ttsSpeakingRate: ttsSpeakingRate,
      useSsml: useSsml,
      ttsEngine: ttsEngine,
      
      autotuneEnabled: autotuneEnabled,
      autotuneKey: autotuneKey,
      autotuneAmount: autotuneAmount,
      autotuneHumanize: autotuneHumanize,
      autotuneVibrato: autotuneVibrato,
      ...overrides
    };
    setPresets(prev => {
        const updated = [...prev, newPreset];
        return updated;
    });
  }, [activeTab, selectedVoice, responseLanguage, inputLanguage, selectedSoundEffect, mimicPitch, mimicRate, mimicIntensity, mimicMode, speechStudioText, ttsVoice, ttsMode, ttsSpeakers, ttsPitch, ttsSpeakingRate, useSsml, ttsEngine, autotuneEnabled, autotuneKey, autotuneAmount, autotuneHumanize, autotuneVibrato]);

  const handleLoadPreset = useCallback((name: string) => {
    const preset = presets.find(p => p.name === name);
    if (!preset) return;

    if (preset.type === 'mimic') {
        if(preset.voice) setSelectedVoice(preset.voice);
        if(preset.language) setResponseLanguage(preset.language);
        if(preset.inputLanguage) setInputLanguage(preset.inputLanguage);
        if(preset.selectedSoundEffect) {
            const effect = customSoundEffects.find(e => e.name === preset.selectedSoundEffect) || { name: preset.selectedSoundEffect, url: '', isCustom: false };
            setSelectedSoundEffect(effect);
        }
        if(preset.mimicPitch !== undefined) setMimicPitch(preset.mimicPitch);
        if(preset.mimicSpeakingRate !== undefined) setMimicRate(preset.mimicSpeakingRate);
        if(preset.mimicIntensity !== undefined) setMimicIntensity(preset.mimicIntensity);
        if(preset.mimicMode) setMimicMode(preset.mimicMode);
        setActiveTab('mimic');
    } else if (preset.type === 'speech-studio') {
        if(preset.ttsText) setSpeechStudioText(preset.ttsText);
        if(preset.ttsVoice) setTtsVoice(preset.ttsVoice);
        if(preset.ttsMode) setTtsMode(preset.ttsMode);
        if(preset.speakers) setTtsSpeakers(preset.speakers);
        if(preset.ttsPitch !== undefined) setTtsPitch(preset.ttsPitch);
        if(preset.ttsSpeakingRate !== undefined) setTtsSpeakingRate(preset.ttsSpeakingRate);
        if(preset.useSsml !== undefined) setUseSsml(preset.useSsml);
        if(preset.ttsEngine) setTtsEngine(preset.ttsEngine);
        setActiveTab('speech-studio');
    } else if (preset.type === 'autotune') {
        if(preset.autotuneEnabled !== undefined) setAutotuneEnabled(preset.autotuneEnabled);
        if(preset.autotuneKey) setAutotuneKey(preset.autotuneKey);
        if(preset.autotuneAmount !== undefined) setAutotuneAmount(preset.autotuneAmount);
        if(preset.autotuneHumanize !== undefined) setAutotuneHumanize(preset.autotuneHumanize);
        if(preset.autotuneVibrato !== undefined) setAutotuneVibrato(preset.autotuneVibrato);
        setActiveTab('autotune');
    }
  }, [presets, ttsSpeakers]);

  const handleDeletePreset = (name: string) => {
    setPresets(prev => {
      const updated = prev.filter(p => p.name !== name);
      return updated;
    });
  };

  const handleCustomEffectUpload = (file: File) => {
      const newEffect: SoundEffect = {
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: URL.createObjectURL(file),
          isCustom: true
      };
      setCustomSoundEffects(prev => [...prev, newEffect]);
      setSelectedSoundEffect(newEffect);
  };

  const handleDeleteEffect = (name: string) => {
      setCustomSoundEffects(prev => prev.filter(e => e.name !== name));
      if (selectedSoundEffect.name === name) setSelectedSoundEffect({ name: 'none', url: '', isCustom: false });
  };

  const handleAnalyzeVoiceSample = async (file: File): Promise<VoiceAnalysis | null> => {
    try {
        const base64Audio = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    parts: [
                        { inlineData: { data: base64Audio, mimeType: file.type || "audio/wav" } },
                        { text: "Analyze this voice sample. Provide a JSON object with: pitch (High/Medium/Low), tone (Warm/Formal/Energetic/Neutral), accent (American/British/Indian/Neutral), gender (Male/Female/Unspecified), style (Steady/Dynamic/Abrupt), and a qualityScore (0-100). Return ONLY the JSON." }
                    ]
                }
            ],
            config: { responseMimeType: "application/json" }
        });

        const result = parseGeminiJson(response.text);
        
        return {
            emotion: 'Neutral', 
            style: result.style || 'Steady',
            pitch: result.pitch || 'Medium',
            tone: result.tone || 'Neutral',
            accent: result.accent || 'Neutral',
            qualityScore: result.qualityScore || 85
        };
    } catch (e) {
        console.error("Analysis Failed", e);
        // Fallback to basic analysis if Gemini fails
        return {
            emotion: 'Neutral',
            style: 'Steady',
            pitch: 'Medium',
            tone: 'Neutral',
            accent: 'Neutral',
            qualityScore: 75
        };
    }
  };

  const handleImportClonedVoice = async (url: string) => { 
    setIsAppBusy(true);
    setServerError(null);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch audio from URL');
        const blob = await response.blob();
        const file = new File([blob], 'imported_voice.wav', { type: blob.type });
        
        const analysis = await handleAnalyzeVoiceSample(file);
        if (analysis) {
            handleCreateClone({
                name: `Imported ${new URL(url).hostname}`,
                baseVoice: analysis.pitch === 'High' ? 'Kore' : 'Puck',
                gender: analysis.pitch === 'High' ? 'Female' : 'Male',
                accent: analysis.accent as Accent || 'Neutral',
                tone: analysis.tone as Tone || 'Neutral',
                notes: `Imported from ${url}`,
                rating: analysis.qualityScore
            }, 10);
        }
    } catch (e: any) {
        setServerError(`Import failed: ${e.message}`);
    } finally {
        setIsAppBusy(false);
    }
  };

  const handleEnhancePlayVoice = async () => {
      if (!playVoicesSettings.prompt.trim()) return;
      
      setPlayVoicesSettings(prev => ({ ...prev, processing: true, error: null }));
      try {
          const buffer = await handleGenerateTTS(playVoicesSettings.prompt, playVoicesSettings.selectedVoiceId);
          if (buffer) {
              setPlayVoicesSettings(prev => ({ ...prev, enhancedVoiceBuffer: buffer }));
          } else {
              setPlayVoicesSettings(prev => ({ ...prev, error: 'Failed to generate audio.' }));
          }
      } catch (e: any) {
          setPlayVoicesSettings(prev => ({ ...prev, error: e.message }));
      } finally {
          setPlayVoicesSettings(prev => ({ ...prev, processing: false }));
      }
  };

  const handleCreateClone = (voiceData: Omit<ClonedVoice, 'createdAt' | 'status' | 'priority' | 'id'>, duration: number = 5) => {
      setIsCloning(true);
      setCloningStatusMessage('Extracting spectral features...');
      setCloningProgress(10);
      setCloningTimeRemaining(duration + 7);

      const interval = setInterval(() => {
          setCloningProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  return 100;
              }
              return prev + 10;
          });
          setCloningTimeRemaining(prev => prev ? Math.max(0, prev - 1) : 0);
      }, 500);

      setTimeout(() => {
          setCloningStatusMessage('Training neural layers...');
      }, 2000);

      setTimeout(() => {
          const newVoice: ClonedVoice = {
              ...voiceData,
              id: Date.now().toString(),
              createdAt: new Date().toLocaleDateString(),
              status: 'Ready',
              priority: 'Medium',
              rating: voiceData.rating || 95
          };
          setClonedVoices(prev => {
              const updated = [newVoice, ...prev];
              return updated;
          });
          setIsCloning(false);
          setCloningProgress(0);
          setCloningTimeRemaining(null);
      }, 5000);
  };

  const handleQuickClone = async (file: File) => {
      const analysis = await handleAnalyzeVoiceSample(file);
      if (analysis) {
          handleCreateClone({
              name: `Quick Clone ${Date.now().toString().slice(-4)}`,
              baseVoice: analysis.pitch === 'High' ? 'Kore' : 'Puck',
              gender: analysis.pitch === 'High' ? 'Female' : 'Male',
              accent: 'Neutral',
              tone: 'Neutral',
              notes: 'Created via Quick Clone'
          }, 5);
      }
  };

  if (!isSystemOnline) {
      return (
          <div className="w-full h-screen bg-bg flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/80 z-10"></div>
              <div className="z-20 text-center space-y-4 animate-pulse">
                  <div className="w-24 h-24 border-4 border-danger rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_var(--danger)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                  </div>
                  <h1 className="text-3xl font-black text-danger tracking-[0.3em] font-mono">SYSTEM OFFLINE</h1>
                  <button onClick={toggleSystemOnline} className="px-8 py-3 bg-carbon-weave border border-tension-line text-text-main font-bold rounded hover:bg-tension-line transition-all font-mono uppercase">
                      REBOOT CORE
                  </button>
              </div>
          </div>
      );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mimic':
        return (
            <MimicryAgent 
            inputLanguage={inputLanguage}
            onInputLanguageChange={setInputLanguage}
            responseLanguage={responseLanguage}
            onResponseLanguageChange={setResponseLanguage}
            targetVoice={selectedVoice}
            onTargetVoiceChange={setSelectedVoice}
            isAppBusy={isAppBusy}
            appStatus={appStatus}
            onStartLive={handleRecord}
            onStopLive={handleStopRecording}
            onPauseLive={handlePauseRecording}
            onResumeLive={handleResumeRecording}
            onResetLive={handleResetSession}
            onGenerate={handleGenerateTTS} 
            analyserNode={inputAnalyserNode || undefined}
            outputFormat={outputFormat}
            transcriptionSegments={transcriptionSegments}
            realtimeMetrics={realtimeMetrics}
            presets={presets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            selectedSoundEffect={selectedSoundEffect.name}
            onSelectEffect={(effectName) => {
                const effect = customSoundEffects.find(e => e.name === effectName) || { name: effectName, url: '', isCustom: false };
                setSelectedSoundEffect(effect);
            }}
            customEffects={customSoundEffects}
            onUploadEffect={handleCustomEffectUpload}
            onDeleteEffect={handleDeleteEffect}
            recordedSessionAudio={recordedAudioBuffer}
            mimicMode={mimicMode === 'repeat' ? 'repeat' : 'conversation'}
            onMimicModeChange={(mode) => setMimicMode(mode as 'repeat' | 'conversation')}
            mimicPitch={mimicPitch} onMimicPitchChange={setMimicPitch}
            mimicRate={mimicRate} onMimicRateChange={setMimicRate}
            mimicIntensity={mimicIntensity} onMimicIntensityChange={setMimicIntensity}
            onSaveSession={handleSaveSession}
            liveTranscription={liveOutputTranscription}
            onAutoDetectLanguage={handleAutoDetectLanguage}
            favoriteLanguages={userPreferences.favoriteLanguages}
            clonedVoices={clonedVoices}
            waveformRegions={waveformRegions}
            asrConfig={asrConfig}
            onAsrConfigChange={setAsrConfig}
            onClearTranscription={handleClearTranscription}
          />
        );
      case 'speech-studio':
          return (
            <SpeechStudio
                activeTab={activeTab}
                appStatus={appStatus}
                isAppBusy={isAppBusy}
                onStartLive={handleStartAsr}
                onStopLive={handleStopAsr}
                onPauseLive={() => {}}
                onResumeLive={() => {}}
                onResetLive={() => { setAsrTranscription(''); setAsrTranscriptionAudio(null); setAppStatus(AppStatus.IDLE); }}
                analyserNode={inputAnalyserNode || undefined}
                liveTranscription={asrTranscription}
                recordedSessionAudio={asrTranscriptionAudio}
                outputFormat={outputFormat}
                onOutputFormatChange={setOutputFormat}
                speechStudioText={speechStudioText}
                onTextChange={setSpeechStudioText}
                language={inputLanguage}
                onLanguageChange={setInputLanguage}
                voice={ttsVoice}
                onVoiceChange={setTtsVoice}
                mode={ttsMode === 'single' ? 'single' : 'multi'}
                onModeChange={(mode) => setTtsMode(mode as 'single' | 'multi')}
                speakers={ttsSpeakers}
                onSpeakersChange={setTtsSpeakers}
                pitch={ttsPitch}
                onPitchChange={setTtsPitch}
                rate={ttsSpeakingRate}
                onRateChange={setTtsSpeakingRate}
                useSsml={useSsml}
                onUseSsmlChange={setUseSsml}
                onGenerate={() => { handleGenerateTTS(speechStudioText); }}
                isGenerating={isTtsGenerating}
                generatedAudio={ttsAudioBuffer}
                onDeleteGenerated={() => setTtsAudioBuffer(null)}
                onRecordPronunciation={handleRecord}
                onStopRecordPronunciation={handleStopRecording}
                onAnalyzePronunciation={handleAnalyzePronunciation}
                isRecordingPronunciation={appStatus === AppStatus.RECORDING}
                isAnalyzingPronunciation={isAnalyzingPronunciation}
                recordedPronunciationAudio={recordedAudioBuffer}
                onDeleteRecordedPronunciation={() => setRecordedAudioBuffer(null)}
                pronunciationAnalysis={pronunciationAnalysisResult}
                ttsEngine={ttsEngine}
                onTtsEngineChange={setTtsEngine}
                inspectionStatus={ttsInspectionStatus}
                presets={presets}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
                onDeletePreset={handleDeletePreset}
                isMoltBotEnabled={moltBotEnabled}
                onVoiceCommand={handleVoiceCommand}
                onQuickClone={handleQuickClone}
                asrConfig={asrConfig}
                onAsrConfigChange={setAsrConfig}
                asrTranscription={asrTranscription}
                favoriteLanguages={userPreferences.favoriteLanguages}
                clonedVoices={clonedVoices}
                onAutoDetectLanguage={handleAutoDetectLanguage}
                sinkId={audioOutputConfig.deviceId}
                onError={setServerError}
            />
          );
      case 'live-translation':
          return <LiveTranslationTab ai={ai} isAppBusy={isAppBusy} setIsAppBusy={setIsAppBusy} outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} sinkId={audioOutputConfig.deviceId} clonedVoices={clonedVoices} presets={presets} onSavePreset={handleSavePreset} onLoadPreset={handleLoadPreset} onDeletePreset={handleDeletePreset} isMoltBotEnabled={moltBotEnabled} favoriteLanguages={userPreferences.favoriteLanguages} />;
      case 'clone':
          return (
            <CloneVoiceForm 
                onClone={handleCreateClone} 
                onAnalyze={handleAnalyzeVoiceSample} 
                onImport={handleImportClonedVoice} 
                isAppBusy={isAppBusy} 
                isCloning={isCloning} 
                cloningStatusMessage={cloningStatusMessage} 
                cloningProgress={cloningProgress} 
                cloningTimeRemaining={cloningTimeRemaining} 
                clonedVoices={clonedVoices} 
                serverError={serverError} 
            />
          );
      case 'autotune':
          return <AutotuneTab 
                    autotuneEnabled={autotuneEnabled} onAutotuneEnabledChange={setAutotuneEnabled} 
                    autotuneKey={autotuneKey} onAutotuneKeyChange={setAutotuneKey} 
                    autotuneAmount={autotuneAmount} onAutotuneAmountChange={setAutotuneAmount} 
                    autotuneHumanize={autotuneHumanize} onAutotuneHumanizeChange={setAutotuneHumanize}
                    autotuneVibrato={autotuneVibrato} onAutotuneVibratoChange={setAutotuneVibrato}
                    originalPitch={currentOriginalPitch} correctedPitch={currentCorrectedPitch} 
                    isAppBusy={isAppBusy} 
                    uploadedAudio={uploadedAutotuneAudio} onUploadedAudioChange={setUploadedAutotuneAudio} 
                    correctedAudio={correctedAutotuneAudio} onCorrectedAudioChange={setCorrectedAutotuneAudio} 
                    onCorrectPitch={handleAutotuneProcess} 
                    sinkId={audioOutputConfig.deviceId} 
                    onToggleAudioHub={() => {}} isAudioHubOpen={false} 
                    onOutputConfigChange={(deviceId) => setAudioOutputConfig(prev => ({ ...prev, deviceId }))}
                />;
      case 'play-voices':
          return <PlayVoicesTab 
                    clonedVoices={clonedVoices} 
                    playVoicesSettings={playVoicesSettings} 
                    setPlayVoicesSettings={setPlayVoicesSettings} 
                    onUploadPlayVoice={(file) => {
                        if (file) {
                            setPlayVoicesSettings(prev => ({ ...prev, uploadedVoiceFile: file }));
                        }
                    }} 
                    onEnhancePlayVoice={handleEnhancePlayVoice} 
                    onResetPlayVoices={() => {
                        setPlayVoicesSettings({
                            prompt: '',
                            uploadedVoiceFile: null,
                            uploadedVoiceBuffer: null,
                            uploadedVoiceAnalysis: null,
                            enhancedVoiceBuffer: null,
                            processing: false,
                            error: null,
                            mimicryAttemptAnalysis: null,
                            selectedVoiceId: 'Zephyr',
                            voiceSourceType: 'prebuilt'
                        });
                    }} 
                    isAppBusy={isAppBusy} 
                    ai={ai} 
                    decode={decode} 
                    decodeAudioData={decodeAudioData} 
                    sinkId={audioOutputConfig.deviceId} 
                    onToggleAudioHub={() => {}} 
                    isAudioHubOpen={false} 
                    outputFormat={outputFormat} 
                />;
      case 'open-source':
          return <OpenSourceLab />;
      case 'agent-core':
          return <AgentCommandCenter agentState={agentState} onCommand={handleAgentCommand} onVoiceInputToggle={() => {}} isRecording={false} transcript="" onOpenMoltBot={() => setShowMoltBot(true)} isMoltBotEnabled={moltBotEnabled} />;
      case 'asr':
          return (
              <SpeechStudio
                  activeTab={activeTab}
                  appStatus={appStatus}
                  isAppBusy={isAppBusy}
                  onStartLive={handleStartAsr}
                  onStopLive={handleStopAsr}
                  onPauseLive={() => {}}
                  onResumeLive={() => {}}
                  onResetLive={() => { setAsrTranscription(''); setAsrTranscriptionAudio(null); setAppStatus(AppStatus.IDLE); }}
                  analyserNode={inputAnalyserNode || undefined}
                  liveTranscription={asrTranscription}
                  recordedSessionAudio={asrTranscriptionAudio}
                  outputFormat={outputFormat}
                  onOutputFormatChange={setOutputFormat}
                  speechStudioText={speechStudioText}
                  onTextChange={setSpeechStudioText}
                  language={inputLanguage}
                  onLanguageChange={setInputLanguage}
                voice={ttsVoice}
                onVoiceChange={setTtsVoice}
                mode={ttsMode === 'single' ? 'single' : 'multi'}
                onModeChange={(mode) => setTtsMode(mode as 'single' | 'multi')}
                speakers={ttsSpeakers}
                onSpeakersChange={setTtsSpeakers}
                  pitch={ttsPitch}
                  onPitchChange={setTtsPitch}
                  rate={ttsSpeakingRate}
                  onRateChange={setTtsSpeakingRate}
                  useSsml={useSsml}
                  onUseSsmlChange={setUseSsml}
                  onGenerate={() => { handleGenerateTTS(speechStudioText); }}
                  isGenerating={isTtsGenerating}
                  generatedAudio={ttsAudioBuffer}
                  onDeleteGenerated={() => setTtsAudioBuffer(null)}
                  onRecordPronunciation={handleRecord}
                  onStopRecordPronunciation={handleStopRecording}
                  onAnalyzePronunciation={handleAnalyzePronunciation}
                  isRecordingPronunciation={appStatus === AppStatus.RECORDING}
                  isAnalyzingPronunciation={isAnalyzingPronunciation}
                  recordedPronunciationAudio={recordedAudioBuffer}
                  onDeleteRecordedPronunciation={() => setRecordedAudioBuffer(null)}
                  pronunciationAnalysis={pronunciationAnalysisResult}
                  ttsEngine={ttsEngine}
                  onTtsEngineChange={setTtsEngine}
                  inspectionStatus={ttsInspectionStatus}
                  presets={presets}
                  onSavePreset={handleSavePreset}
                  onLoadPreset={handleLoadPreset}
                  onDeletePreset={handleDeletePreset}
                  isMoltBotEnabled={moltBotEnabled}
                  onVoiceCommand={handleVoiceCommand}
                  onQuickClone={handleQuickClone}
                  asrConfig={asrConfig}
                  onAsrConfigChange={setAsrConfig}
                  asrTranscription={asrTranscription}
                  favoriteLanguages={userPreferences.favoriteLanguages}
                  clonedVoices={clonedVoices}
                  onAutoDetectLanguage={handleAutoDetectLanguage}
                  sinkId={audioOutputConfig.deviceId}
                  onError={setServerError}
              />
          );
      case 'moltbot':
          return <MoltBotTab agentState={agentState} systemLogs={systemLogs} onToggleAutomation={setMoltBotEnabled} isAutomationEnabled={moltBotEnabled} onExecuteCommand={handleAgentCommand} />;
      case 'data': 
          return (
              <div className="space-y-6">
                  <Dashboard metrics={dashboardMetrics} />
                  <SystemSentinel logs={systemLogs} onResolve={handleResolveLog} onClose={() => {}} />
              </div>
          );
      case 'languages':
          return <LanguageManager preferences={userPreferences} onUpdatePreferences={setUserPreferences} />;
      case 'settings':
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
                <NexusHub providers={apiProviders} onAddProvider={p => setApiProviders(prev => [...prev, p])} onClose={() => {}} />
                <AudioControlHub inputConfig={audioInputConfig} onInputConfigChange={setAudioInputConfig} outputConfig={audioOutputConfig} onOutputConfigChange={setAudioOutputConfig} isAppBusy={isAppBusy} />
                <NeuralinkIntegration providers={neuralinkProviders} onUpdateProvider={(p) => setNeuralinkProviders(prev => prev.map(pr => pr.id === p.id ? p : pr))} />
                <GoogleDriveBackup settings={backupSettings} onSettingsChange={setBackupSettings} />
            </div>
          );
      default: return null;
    }
  };

  const navItems = [
    { id: 'moltbot', label: 'MOLTBOT [CORE]' },
    { id: 'agent-core', label: 'Agent Command' },
    { id: 'mimic', label: 'Live Chat' },
    { id: 'speech-studio', label: 'Speech Studio' },
    { id: 'live-translation', label: 'Live Translation' },
    { id: 'play-voices', label: 'Play Voices' },
    { id: 'clone', label: 'Voice Cloning' },
    { id: 'open-source', label: 'Open Source Lab' },
    { id: 'autotune', label: 'Autotune' },
    { id: 'data', label: 'Dashboard' },
    { id: 'languages', label: 'Languages' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden relative bg-bg">
      {serverError && <GlobalErrorToast message={serverError} onClose={() => setServerError(null)} />}
      <header className="p-4 sm:p-6 border-b border-tension-line/20 flex justify-between items-center bg-bg/95 backdrop-blur-3xl shrink-0 z-50">
          <Logo />
          <div className="flex items-center gap-4">
              {moltBotEnabled && (
                  <button 
                    onClick={() => setShowMoltBot(true)}
                    className="hidden sm:flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent rounded-full text-accent text-[10px] font-mono font-bold animate-pulse hover:bg-accent/20 transition-all cursor-pointer shadow-[0_0_10px_var(--accent-dim)]"
                  >
                      <div className="w-2 h-2 bg-accent rounded-full animate-ping"></div>
                      MOLTBOT: ACTIVE
                  </button>
              )}
              <div className={`px-3 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest ${isSystemOnline ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'}`}>
                  {isSystemOnline ? 'SYSTEM OPTIMAL' : 'OFFLINE'}
              </div>
              <button 
                onClick={() => setIsSystemOnline(!isSystemOnline)} 
                className={`p-2.5 rounded-full transition-all duration-500 border ${isSystemOnline ? 'bg-carbon-base hover:bg-carbon-weave border-white/5 text-text-dim' : 'bg-danger text-white border-danger'}`}
              >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden p-2.5 rounded-xl bg-carbon-base border border-tension-line/20 text-text-main shadow-lg"
              >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
          {isMobileMenuOpen && (
              <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
                  onClick={() => setIsMobileMenuOpen(false)}
              />
          )}
          <aside className={`absolute lg:relative z-40 inset-y-0 left-0 w-72 bg-bg/95 backdrop-blur-3xl border-r border-tension-line/20 flex flex-col p-6 gap-3 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="flex justify-between items-center mb-4 lg:mb-0">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em] opacity-40">Operations</p>
                <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-text-dim hover:text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
                {navItems.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => { setActiveTab(tab.id as ActiveTab); setIsMobileMenuOpen(false); }} 
                    className={`p-4 text-left rounded-2xl font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 border shrink-0 ${
                        activeTab === tab.id 
                        ? tab.id === 'moltbot' 
                            ? 'bg-accent text-carbon-base shadow-[0_0_20px_var(--accent-dim)] border-accent'
                            : 'bg-carbon-weave text-text-main border-tension-line' 
                        : tab.id === 'moltbot' 
                            ? 'text-accent border-accent/30 hover:bg-accent/10'
                            : 'text-text-dim hover:text-text-main hover:bg-carbon-base/50 border-transparent hover:border-white/5'
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>
          </aside>
          
          <main className="flex-1 p-0 overflow-hidden relative bg-black/20">
              {isSystemOnline ? (
                  <div className="h-full overflow-y-auto custom-scrollbar p-4 sm:p-6">
                      {renderTabContent()}
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-6 animate-fade-in">
                      <div className="w-24 h-24 rounded-full border-4 border-danger border-dashed animate-[spin_10s_linear_infinite] flex items-center justify-center shadow-glow-red">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                      </div>
                      <h2 className="text-2xl font-black text-danger tracking-[0.5em] font-mono">OFFLINE</h2>
                      <button onClick={() => setIsSystemOnline(true)} className="px-10 py-4 bg-carbon-base border-2 border-tension-line text-text-main font-black rounded-2xl hover:bg-accent hover:text-carbon-base transition-all font-mono uppercase tracking-[0.2em] shadow-2xl active:scale-95 z-20">Reboot Neural Matrix</button>
                  </div>
              )}
          </main>
      </div>
      
      <MoltBotModal 
        isOpen={showMoltBot} 
        onClose={() => setShowMoltBot(false)} 
        isEnabled={moltBotEnabled} 
        onToggleEnabled={setMoltBotEnabled} 
        asrConfig={asrConfig}
        onAsrConfigChange={setAsrConfig}
      />
      <LivePodcastModal open={showLivePodcastModal} onClose={() => setShowLivePodcastModal(false)} clonedVoices={clonedVoices} />
      <DebugConsole />
      <FloatingAssistant 
        apiProviders={apiProviders} 
        chatInputValue={chatInputValue} 
        onChatInputValueChange={setChatInputValue} 
        onAgentCommand={handleAgentCommand}
      />
    </div>
  );
};

export default App;
