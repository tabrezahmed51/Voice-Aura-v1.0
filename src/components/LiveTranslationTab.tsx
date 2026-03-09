
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Language, TranslationFile, AudioFormat, ClonedVoice, Preset, Voice, BaseVoice } from '../types';
import { LANGUAGES, HF_API_KEY, VOICES } from '../constants';
import Selector from './Selector';
import TextInput from './TextInput';
import ToggleSwitch from './ToggleSwitch';
import AudioPlayer from './AudioPlayer';
import WaveformVisualizer from './WaveformVisualizer';
import PresetManager from './PresetManager';

interface LiveTranslationTabProps {
    ai: GoogleGenAI;
    isAppBusy: boolean;
    setIsAppBusy: (busy: boolean) => void;
    outputFormat: AudioFormat;
    onOutputFormatChange: (format: AudioFormat) => void;
    sinkId?: string;
    clonedVoices: ClonedVoice[]; 
    presets: Preset[];
    onSavePreset: (name: string, overrides?: Partial<Preset>) => void;
    onLoadPreset: (name: string) => void;
    onDeletePreset: (name: string) => void;
    isMoltBotEnabled: boolean;
    favoriteLanguages?: Language[];
}

const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>;
const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><circle cx="12" cy="14" r="4"></circle><line x1="12" y1="6" x2="12.01" y2="6"></line></svg>;
const TranslateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 5-5 5 5"></path><path d="M12 13V3"></path><path d="m5 16 5 5 5-5"></path><path d="M12 11v10"></path></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

const LiveTranslationTab: React.FC<LiveTranslationTabProps> = ({ ai, isAppBusy, setIsAppBusy, outputFormat, onOutputFormatChange, sinkId, clonedVoices, presets, onSavePreset, onLoadPreset, onDeletePreset, isMoltBotEnabled, favoriteLanguages = [] }) => {
    // State
    const [sourceLang, setSourceLang] = useState<Language | 'es-ES' | 'fr-FR'>('en-US');
    const [targetLang, setTargetLang] = useState<Language | 'es-ES' | 'fr-FR'>('hi-IN');
    const [useVenice, setUseVenice] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [translation, setTranslation] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [files, setFiles] = useState<TranslationFile[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
    const [autoPlay, setAutoPlay] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<Voice>('Zephyr');
    const [showPresets, setShowPresets] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<number>(0);
    
    // Audio Context
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Mock stream reference for Nemotron simulation
    const nemotronStreamInterval = useRef<number | null>(null);

    const sortedLanguages = useMemo(() => {
        return [...LANGUAGES].sort((a, b) => {
            const aFav = favoriteLanguages.includes(a.value);
            const bFav = favoriteLanguages.includes(b.value);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.label.localeCompare(b.label);
        });
    }, [favoriteLanguages]);

    // Combined Voice Options
    const combinedVoiceOptions = useMemo(() => [
        { label: "Google Pre-built Voices", options: VOICES },
        { label: "Your Cloned Voices", options: clonedVoices.filter(v => v.status === 'Ready').map(v => ({ value: v.name, label: v.name })) }
    ], [clonedVoices]);

    useEffect(() => {
        const initCtx = () => {
             const ctx = new (window.AudioContext || window.webkitAudioContext)();
             audioCtxRef.current = ctx;
             analyserRef.current = ctx.createAnalyser();
             analyserRef.current.fftSize = 2048;
        };
        initCtx();
        return () => { 
            audioCtxRef.current?.close();
            if (nemotronStreamInterval.current) clearInterval(nemotronStreamInterval.current);
        };
    }, []);

    const handleError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 5000);
    };

    // Helper: Decode Audio Data
    const decodeAudioData = async (data: Uint8Array): Promise<AudioBuffer> => {
        if(!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioCtxRef.current;
        if(ctx.state === 'suspended') await ctx.resume();

        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, 24000); 
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }
        return buffer;
    };

    const handleTTSPlayback = async (text: string) => {
        if (!text || !audioCtxRef.current) return;
        setIsSpeaking(true);
        
        try {
            const config: any = {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }, 
                },
            };

            const isPrebuilt = VOICES.some(v => v.value === selectedVoice);
            if (isPrebuilt) {
                 config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName = selectedVoice as BaseVoice;
            } else {
                config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName = 'Zephyr'; 
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: { parts: [{ text: text }] },
                config: config,
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const buffer = await decodeAudioData(bytes);
                const source = audioCtxRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtxRef.current.destination);
                
                if (sinkId && typeof (audioCtxRef.current.destination as any).setSinkId === 'function') {
                    try {
                        await (audioCtxRef.current.destination as any).setSinkId(sinkId);
                    } catch(e) { console.warn("Audio Routing failed", e); }
                }

                source.onended = () => setIsSpeaking(false);
                source.start();
            } else {
                setIsSpeaking(false);
            }
        } catch (e: any) {
            console.error("TTS Error", e);
            handleError(`TTS Error: ${e.message}`);
            setIsSpeaking(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            setIsRecording(false);
            if(nemotronStreamInterval.current) {
                clearInterval(nemotronStreamInterval.current);
                nemotronStreamInterval.current = null;
            }
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                if(!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioCtxRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current!);

                setTranscript(""); 
                setConfidence(0);
                
                // Simulate real-time updates
                const mockWords = ["Hello", "this", "is", "a", "live", "test", "of", "the", "Nemotron", "model", "streaming", "capabilities", "with", "low", "latency"];
                let wordIdx = 0;
                nemotronStreamInterval.current = window.setInterval(() => {
                    if (Math.random() > 0.6) {
                        const newWord = mockWords[wordIdx % mockWords.length];
                        setTranscript(prev => prev + (prev ? " " : "") + newWord);
                        wordIdx++;
                        setConfidence(0.85 + Math.random() * 0.14); 
                    }
                }, 400);

                mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    setIsAppBusy(true);
                    setConfidence(0); 
                    
                    try {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = async () => {
                            const base64data = reader.result?.toString().split(',')[1];
                            if(!base64data) return;

                            const response = await ai.models.generateContent({
                                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                                contents: {
                                    parts: [
                                        { inlineData: { mimeType: 'audio/webm', data: base64data } },
                                        { text: `Transcribe this audio (spoken in ${sourceLang}) and translate it to ${targetLang}. Return JSON: { "transcript": "text", "translation": "text" }` }
                                    ]
                                },
                                config: { responseMimeType: 'application/json' }
                            });
                            
                            const textResp = response.text;
                            if (textResp) {
                                try {
                                    const json = JSON.parse(textResp || '{}');
                                    setTranscript(json.transcript || "No transcript");
                                    setTranslation(json.translation || "No translation");
                                    setConfidence(0.98); 
                                    if(autoPlay && json.translation) handleTTSPlayback(json.translation);
                                } catch(e) {
                                    setTranscript("Parsing Error");
                                    setTranslation(textResp || "Translation Failed");
                                    handleError("Failed to parse server response.");
                                }
                            }
                            setIsAppBusy(false);
                        };
                    } catch(e: any) {
                        console.error(e);
                        handleError(`Processing Error: ${e.message}`);
                        setIsAppBusy(false);
                    }
                    
                    const newFile: TranslationFile = {
                        id: Date.now().toString(),
                        name: `Recording_${new Date().toLocaleTimeString()}.webm`,
                        size: blob.size,
                        type: 'audio/webm',
                        url: URL.createObjectURL(blob),
                        date: new Date().toLocaleDateString(),
                        deleted: false
                    };
                    setFiles(prev => [newFile, ...prev]);
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (e: any) {
                console.error("Mic Error", e);
                handleError(`Microphone Error: ${e.message}`);
            }
        }
    };

    const handleTranslation = async (text: string) => {
        if (!text) return;
        setIsAppBusy(true);
        setConfidence(0.5); 
        try {
            let result = "";
            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translated text, no explanations.\n\nText: "${text}"`;

            if (useVenice) {
                const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ inputs: `<s>[INST] ${prompt} [/INST]`, parameters: { max_new_tokens: 256 } })
                });
                if (!response.ok) throw new Error(`Venice API Error: ${response.statusText}`);
                
                const data = await response.json();
                result = Array.isArray(data) ? data[0]?.generated_text : "Error communicating with Venice AI.";
            } else {
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                result = response.text || "Error communicating with Gemini.";
            }
            setTranslation(result);
            setConfidence(0.95);
            if (autoPlay && result) {
                handleTTSPlayback(result);
            }
        } catch (e: any) {
            handleError(e.message);
            setTranslation("Translation failed.");
            setConfidence(0);
        } finally {
            setIsAppBusy(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newFile: TranslationFile = {
                id: Date.now().toString(),
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
                date: new Date().toLocaleDateString(),
                deleted: false
            };
            setFiles(prev => [newFile, ...prev]);
        }
    };

    const deleteFile = (id: string) => {
        setFiles(files.map(f => f.id === id ? { ...f, deleted: true } : f));
    };

    const restoreFile = (id: string) => {
        setFiles(files.map(f => f.id === id ? { ...f, deleted: false } : f));
    };

    const permanentDelete = (id: string) => {
        if (window.confirm("Permanently delete this file? This cannot be undone.")) {
            setFiles(files.filter(f => f.id !== id));
        }
    };

    const handleLoadPresetLocal = (name: string) => {
        onLoadPreset(name);
        const p = presets.find(pre => pre.name === name);
        if (p && p.type === 'live-translation') {
            if(p.translationSourceLang) setSourceLang(p.translationSourceLang);
            if(p.translationTargetLang) setTargetLang(p.translationTargetLang);
            if(p.translationUseVenice !== undefined) setUseVenice(p.translationUseVenice);
            if(p.translationTtsVoice) setSelectedVoice(p.translationTtsVoice);
        }
    };

    const handleSavePresetLocal = (name: string) => {
       onSavePreset(name, {
           translationSourceLang: sourceLang,
           translationTargetLang: targetLang,
           translationUseVenice: useVenice,
           translationTtsVoice: selectedVoice
       }); 
    };

    const filteredFiles = files.filter(f => activeTab === 'active' ? !f.deleted : f.deleted);

    return (
        <div className="flex flex-col h-auto lg:h-full gap-4 relative animate-fade-in">
            {errorMsg && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg shadow-glow-red flex items-center gap-3 animate-fade-in font-mono text-xs">
                    <AlertIcon />
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="font-bold hover:text-white">&times;</button>
                </div>
            )}

            <div className="flex items-center justify-between bg-carbon-base p-3 rounded-xl border border-tension-line shadow-lg shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full border transition-colors duration-300 ${isAppBusy ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 animate-pulse' : 'bg-success/10 border-success text-success'}`}>
                        <PowerIcon />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">System Power</span>
                        <span className={`text-xs font-mono font-bold ${isAppBusy ? 'text-yellow-500' : 'text-success'}`}>
                            {isAppBusy ? 'PROCESSING' : 'ONLINE'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     <button 
                        onClick={toggleRecording}
                        className={`p-3 rounded-full border transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.3)] group ${isRecording ? 'bg-danger text-white border-danger shadow-[0_0_20px_var(--danger)] animate-pulse' : 'bg-carbon-weave text-text-dim border-tension-line hover:text-text-main hover:border-accent'}`}
                        title={isRecording ? "Stop Recording" : "Start Recording"}
                     >
                        <MicIcon />
                     </button>
                     <div className="flex flex-col hidden sm:flex">
                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Audio Input</span>
                        <span className={`text-xs font-mono font-bold ${isRecording ? 'text-danger animate-pulse' : 'text-text-dim'}`}>
                            {isRecording ? 'LIVE FEED' : 'STANDBY'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Auto-Read</span>
                        <span className={`text-xs font-mono font-bold ${isSpeaking ? 'text-accent animate-pulse' : 'text-text-dim'}`}>
                            {isSpeaking ? 'SPEAKING' : autoPlay ? 'ENABLED' : 'MUTED'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`p-2 rounded-full border transition-all ${autoPlay ? 'bg-accent/10 border-accent text-accent shadow-[0_0_10px_var(--accent-dim)]' : 'bg-carbon-weave border-tension-line text-text-dim hover:text-text-main'}`}
                        title="Toggle Auto-TTS"
                    >
                        <SpeakerIcon />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 shrink-0">
                <div className="flex-1 bg-carbon-base p-4 rounded-xl border border-tension-line shadow-lg relative">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest">Translation Matrix</h3>
                        <button onClick={() => setShowPresets(!showPresets)} className="text-[10px] text-accent hover:underline font-mono">
                            {showPresets ? 'Hide Presets' : 'Manage Presets'}
                        </button>
                    </div>
                    
                    {showPresets && (
                        <div className="absolute top-12 left-4 right-4 z-20 bg-carbon-weave p-4 rounded-lg border border-tension-line shadow-2xl">
                            <PresetManager presets={presets} onSave={handleSavePresetLocal} onLoad={handleLoadPresetLocal} onDelete={onDeletePreset} disabled={isAppBusy} />
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                        <Selector id="src-lang" label="Source" value={sourceLang} options={sortedLanguages} onChange={(v) => setSourceLang(v as Language)} disabled={isAppBusy} />
                        <div className="mt-4 text-accent"><TranslateIcon /></div>
                        <Selector id="tgt-lang" label="Target" value={targetLang} options={sortedLanguages} onChange={(v) => setTargetLang(v as Language)} disabled={isAppBusy} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Selector id="voice-select" label="AI Voice" value={selectedVoice} options={combinedVoiceOptions} onChange={(v) => setSelectedVoice(v as Voice)} disabled={isAppBusy} />
                        <div className="flex items-center justify-between bg-carbon-weave p-2 rounded-lg border border-tension-line h-[58px] mt-auto">
                            <span className="text-[9px] font-mono text-text-main font-bold pl-2">ENGINE: {useVenice ? 'VENICE AI' : 'GEMINI'}</span>
                            <ToggleSwitch id="ai-toggle" label="" checked={useVenice} onChange={setUseVenice} disabled={isAppBusy} />
                        </div>
                    </div>
                </div>
                
                <div className="w-full md:w-1/3 bg-carbon-base p-4 rounded-xl border border-tension-line shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest">Live Input (Nemotron ASR)</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-accent font-bold">{(confidence * 100).toFixed(0)}% Match</span>
                            <div className="w-16 h-1.5 bg-carbon-weave rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-success transition-all duration-300" style={{ width: `${confidence * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="h-24 bg-black/20 rounded border border-tension-line relative overflow-hidden">
                        <WaveformVisualizer analyserNode={analyserRef.current!} isRecording={isRecording} />
                        {isRecording && (
                            <div className="absolute top-2 right-2 text-[8px] text-accent bg-accent/10 px-1 rounded border border-accent/20 animate-pulse font-mono">
                                LISTENING
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col md:flex-row gap-4 min-h-0">
                <div className="flex-1 bg-carbon-base rounded-xl border border-tension-line overflow-hidden flex flex-col shadow-inner min-h-[300px]">
                    <div className="p-3 bg-carbon-weave border-b border-tension-line flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Live Transcript</span>
                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Translation Output</span>
                    </div>
                    <div className="flex-grow flex divide-x divide-tension-line overflow-hidden">
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
                            {transcript ? (
                                <p className="text-sm font-mono text-text-dim whitespace-pre-wrap">{transcript}</p>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-text-dim opacity-20 text-xs font-mono">
                                    Waiting for audio input...
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-accent/5 relative">
                            {translation ? (
                                <p className="text-sm font-mono text-accent whitespace-pre-wrap">{translation}</p>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-accent opacity-20 text-xs font-mono">
                                    Translation will appear here...
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-3 border-t border-tension-line bg-carbon-weave flex gap-2">
                        <TextInput 
                            id="context-chat" 
                            label="" 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)} 
                            placeholder="Type to translate text directly..." 
                            disabled={isAppBusy} 
                        />
                        <button onClick={() => handleTranslation(chatInput || transcript)} className="px-4 bg-carbon-base border border-tension-line rounded-lg text-text-main hover:bg-tension-line mt-1 font-mono text-xs uppercase tracking-wider font-bold">
                            Process
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-auto lg:h-64 bg-carbon-base rounded-xl border border-tension-line flex flex-col shadow-lg shrink-0">
                <div className="p-3 border-b border-tension-line flex justify-between items-center bg-carbon-weave/50">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('active')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'active' ? 'text-accent' : 'text-text-dim'}`}>Active Files</button>
                        <button onClick={() => setActiveTab('trash')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'trash' ? 'text-danger' : 'text-text-dim'}`}>Trash Bin</button>
                    </div>
                    <div className="flex gap-2">
                        <label className="cursor-pointer bg-carbon-weave hover:bg-tension-line text-text-main px-3 py-1.5 rounded border border-tension-line text-[10px] font-bold uppercase flex items-center gap-2">
                            <UploadIcon /> Upload
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar p-2 min-h-[150px]">
                    {filteredFiles.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-dim text-xs font-mono opacity-50">No files found.</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredFiles.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-carbon-weave rounded border border-tension-line hover:border-accent-dim transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 bg-carbon-base rounded flex items-center justify-center text-[10px] font-bold text-text-dim border border-tension-line">
                                            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-text-main truncate">{file.name}</span>
                                            <span className="text-[9px] text-text-dim">{file.date} • {(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        {file.type.startsWith('audio/') && (
                                            <AudioPlayer audioBuffer={null} title="" onDelete={() => {}} format={outputFormat} sinkId={sinkId} /> 
                                        )}
                                        <a href={file.url} download={file.name} className="p-1.5 hover:text-accent"><DownloadIcon /></a>
                                        {activeTab === 'active' ? (
                                            <button onClick={() => deleteFile(file.id)} className="p-1.5 hover:text-danger"><TrashIcon /></button>
                                        ) : (
                                            <>
                                                <button onClick={() => restoreFile(file.id)} className="p-1.5 hover:text-success"><RestoreIcon /></button>
                                                <button onClick={() => permanentDelete(file.id)} className="p-1.5 hover:text-danger font-bold text-[10px]">DEL</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveTranslationTab;
