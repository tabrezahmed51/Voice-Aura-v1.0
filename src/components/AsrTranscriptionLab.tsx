
import React, { useState, useEffect, useRef } from 'react';
import { AsrConfig, NemotronChunkSize } from '../types';
import { NEMOTRON_CHUNK_OPTIONS } from '../constants';
import WaveformVisualizer from './WaveformVisualizer';

interface AsrTranscriptionLabProps {
    config: AsrConfig;
    onConfigChange: (config: AsrConfig) => void;
    isRecording: boolean;
    transcription: string;
    onStart: () => void;
    onStop: () => void;
    analyserNode?: AnalyserNode;
    recordedAudio?: AudioBuffer | null;
}

const AsrTranscriptionLab: React.FC<AsrTranscriptionLabProps> = ({
    config, onConfigChange, isRecording, transcription, onStart, onStop, analyserNode, recordedAudio
}) => {
    const [streamMetrics, setStreamMetrics] = useState({
        latency: 0,
        throughput: 0,
        rtf: 0.0 // Real Time Factor
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll transcription
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcription]);

    // Simulate metrics when recording
    useEffect(() => {
        if (isRecording) {
            const interval = setInterval(() => {
                // Simulate latency based on chunk size (smaller chunk = lower latency, higher overhead)
                const baseLatency = config.chunkSize; 
                const jitter = Math.random() * 20;
                
                // Throughput (simulated tokens/sec)
                const baseThroughput = 15;
                const throughputVar = Math.floor(Math.random() * 5);
                
                // RTF (simulated) - lower is better. Larger chunks might process slightly faster per second of audio but add latency.
                const baseRtf = 0.05 + (config.chunkSize > 500 ? 0.01 : 0);

                setStreamMetrics({
                    latency: baseLatency + jitter,
                    throughput: baseThroughput + throughputVar,
                    rtf: parseFloat((baseRtf + Math.random() * 0.02).toFixed(3))
                });
            }, 800);
            return () => clearInterval(interval);
        } else {
            setStreamMetrics({ latency: 0, throughput: 0, rtf: 0 });
        }
    }, [isRecording, config.chunkSize]);

    const selectedOption = NEMOTRON_CHUNK_OPTIONS.find(o => o.value === config.chunkSize);

    return (
        <div className="flex flex-col h-full gap-4 animate-fade-in font-mono">
            {/* Header Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                <div className="bg-carbon-weave p-3 rounded-lg border border-tension-line shadow-inner flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 opacity-20 text-[#76b900]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2-1-2-1-2 1 2 1z"></path></svg>
                    </div>
                    <span className="text-[9px] text-text-dim uppercase tracking-widest">Cache Latency</span>
                    <span className="text-sm font-bold text-success">{streamMetrics.latency.toFixed(1)}ms</span>
                </div>
                <div className="bg-carbon-weave p-3 rounded-lg border border-tension-line shadow-inner flex flex-col items-center">
                    <span className="text-[9px] text-text-dim uppercase tracking-widest">Context Window</span>
                    <span className="text-sm font-bold text-[#76b900]">{selectedOption?.context || '[70, 0]'}</span>
                </div>
                <div className="bg-carbon-weave p-3 rounded-lg border border-tension-line shadow-inner flex flex-col items-center">
                    <span className="text-[9px] text-text-dim uppercase tracking-widest">Real-Time Factor</span>
                    <span className="text-sm font-bold text-purple-400">{streamMetrics.rtf}x</span>
                </div>
            </div>

            {/* Visualizer & Transcript */}
            <div className="flex-grow bg-carbon-base rounded-xl border border-tension-line overflow-hidden flex flex-col shadow-lg relative min-h-0">
                {/* Visualizer Area - Overriding CSS var for Green theme */}
                <div className="h-48 bg-carbon-weave border-b border-tension-line shrink-0 relative" style={{'--accent': '#76b900'} as React.CSSProperties}>
                    <WaveformVisualizer analyserNode={analyserNode} isRecording={isRecording} color="#76b900" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded border border-[#76b900]/30 text-[9px] text-[#76b900] uppercase tracking-wider font-bold">
                        Spectral Input
                    </div>
                </div>

                {/* Transcription Output */}
                <div className="flex-grow p-4 overflow-hidden flex flex-col relative bg-black/20">
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-carbon-base to-transparent pointer-events-none"></div>
                    <div 
                        ref={scrollRef}
                        className="flex-grow overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed space-y-2 p-2"
                    >
                        {transcription ? (
                            <p className="text-text-main whitespace-pre-wrap">{transcription}</p>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-dim opacity-30">
                                <svg className="w-12 h-12 mb-4 text-[#76b900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <p className="text-xs uppercase tracking-widest">Awaiting Audio Stream</p>
                            </div>
                        )}
                        {isRecording && <div className="w-2 h-4 bg-[#76b900] animate-pulse inline-block align-middle ml-1"></div>}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-carbon-base to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default AsrTranscriptionLab;
