
import React, { useState, useRef, useEffect } from 'react';
import { AudioFormat } from '../types';

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;

const bufferToWave = (abuffer: AudioBuffer): Blob => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let pos = 0;
    const setUint16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
    const setUint32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    const channels = Array.from({ length: abuffer.numberOfChannels }, (_, i) => abuffer.getChannelData(i));
    let offset = 0;
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][offset] || 0));
            view.setInt16(pos, sample < 0 ? sample * 32768 : sample * 32767, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
};

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  title: string;
  onDelete?: () => void;
  sinkId?: string; 
  format?: AudioFormat;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, title, onDelete, sinkId, format = 'wav' }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioElRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let url: string | null = null;
        if (audioBuffer) {
            const wavBlob = bufferToWave(audioBuffer);
            url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
        } else {
            setAudioUrl(null); setIsPlaying(false); setPlaybackTime(0); setDuration(0);
        }
        return () => { if (url) URL.revokeObjectURL(url); };
    }, [audioBuffer]);

    useEffect(() => {
        const switchOutput = async () => {
            if (!audioElRef.current || typeof (audioElRef.current as any).setSinkId !== 'function') return;
            try { await (audioElRef.current as any).setSinkId(sinkId || ''); } catch(e) { console.warn("Audio routing failed:", e); }
        };
        switchOutput();
    }, [sinkId]);
    
    useEffect(() => {
        if(progressRef.current && duration > 0) {
            const progress = (playbackTime / duration) * 100;
            progressRef.current.style.background = `linear-gradient(to right, var(--accent) ${progress}%, var(--carbon-weave) ${progress}%)`; 
        } else if (progressRef.current) {
             progressRef.current.style.background = 'var(--carbon-weave)'; 
        }
    }, [playbackTime, duration]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60); const sc = Math.floor(s % 60);
        return `${m}:${sc < 10 ? '0' : ''}${sc}`;
    }

    const handleStop = () => {
        if(audioElRef.current) {
            audioElRef.current.pause();
            audioElRef.current.currentTime = 0;
            setIsPlaying(false);
            setPlaybackTime(0);
        }
    }

    if (!audioBuffer) return null;

    return (
        <div className="bg-carbon-weave border-2 border-tension-line p-3 rounded-xl shadow-lg w-full transition-all duration-300 hover:border-accent hover:shadow-glow-teal">
            <div className="flex justify-between items-center mb-2 px-1">
                <h4 className="font-mono font-bold text-[10px] text-text-dim uppercase tracking-widest truncate max-w-[70%] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_5px_var(--accent)] animate-pulse"></span>
                    {title} <span className="opacity-40">[{format.toUpperCase()}]</span>
                </h4>
                <div className="flex items-center gap-1">
                    {onDelete && (
                        <button 
                            onClick={onDelete} 
                            className="p-1.5 text-text-dim hover:text-danger transition-colors rounded hover:bg-carbon-base/50" 
                            title="Delete"
                        >
                            <TrashIcon/>
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-1">
                    <button onClick={() => isPlaying ? audioElRef.current?.pause() : audioElRef.current?.play()} className={`p-2 rounded-full transition-all transform hover:scale-105 ${isPlaying ? 'bg-accent text-carbon-base shadow-glow-teal' : 'bg-carbon-base text-text-main border border-tension-line hover:border-accent hover:text-accent'}`}>
                        {isPlaying ? <PauseIcon/> : <PlayIcon/>}
                    </button>
                    <button onClick={handleStop} className="p-2 rounded-full bg-carbon-base text-text-dim border border-tension-line hover:border-danger hover:text-danger transition-all hover:scale-105" title="Stop">
                        <StopIcon/>
                    </button>
                </div>
                
                <div className="flex-grow relative flex items-center gap-2">
                     <span className="text-[9px] font-mono text-text-dim w-8 text-right">{formatTime(playbackTime)}</span>
                     <input ref={progressRef} type="range" min="0" max={duration || 1} value={playbackTime} onChange={e => { if(audioElRef.current) audioElRef.current.currentTime = parseFloat(e.target.value) }} className="flex-grow h-1.5 rounded-lg appearance-none cursor-pointer bg-carbon-base accent-accent focus:outline-none" />
                     <span className="text-[9px] font-mono text-text-dim w-8">{formatTime(duration)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => {if(audioElRef.current) audioElRef.current.currentTime = 0;}} 
                        className="p-2 bg-carbon-base hover:bg-carbon-weave rounded-lg text-text-dim hover:text-info transition-colors border border-tension-line shadow-sm"
                        title="Reset Playhead"
                    >
                        <ResetIcon/>
                    </button>
                    <a 
                        href={audioUrl!} 
                        download={`${title.toLowerCase().replace(/ /g, '_')}.${format}`} 
                        className="p-2 bg-carbon-base hover:bg-carbon-weave rounded-lg text-text-dim hover:text-accent transition-colors border border-tension-line shadow-sm hover:shadow-glow-teal"
                        title="Download"
                    >
                        <DownloadIcon/>
                    </a>
                </div>
            </div>
            {audioUrl && <audio ref={audioElRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={e => setPlaybackTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onEnded={() => {setIsPlaying(false); setPlaybackTime(0);}}></audio>}
        </div>
    );
};

export default AudioPlayer;
