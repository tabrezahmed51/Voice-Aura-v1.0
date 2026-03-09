
import { useState, useRef, useCallback } from 'react';
import { AudioInputConfig, AudioOutputConfig } from '../types';

export function useAudioEngine(audioOutputConfig: AudioOutputConfig) {
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const [inputAnalyserNode, setInputAnalyserNode] = useState<AnalyserNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  const initAudioEngine = useCallback((activeEffectBuffer: AudioBuffer | null, isLoudSpeakerMode: boolean) => {
    if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    }
    const analyser = inputAudioContextRef.current.createAnalyser();
    analyser.fftSize = 2048;
    setInputAnalyserNode(analyser);

    if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    
    if (outputAudioContextRef.current) {
        if (!outputGainNodeRef.current) {
            outputGainNodeRef.current = outputAudioContextRef.current.createGain();
        }
        outputGainNodeRef.current.gain.value = isLoudSpeakerMode ? Math.min(audioOutputConfig.masterVolume * 3, 3.0) : audioOutputConfig.masterVolume;

        if (activeEffectBuffer) {
             if (!reverbNodeRef.current) {
                 reverbNodeRef.current = outputAudioContextRef.current.createConvolver();
             }
             reverbNodeRef.current.buffer = activeEffectBuffer;
             reverbNodeRef.current.disconnect();
             reverbNodeRef.current.connect(outputGainNodeRef.current);
        } else {
             if (reverbNodeRef.current) {
                 reverbNodeRef.current.disconnect();
             }
        }
        
        outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);
    }
    return analyser;
  }, [audioOutputConfig.masterVolume]);

  const cleanupAudioEngine = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') { 
        inputAudioContextRef.current.close().catch(() => {}); 
        inputAudioContextRef.current = null; 
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') { 
        outputAudioContextRef.current.close().catch(() => {}); 
        outputAudioContextRef.current = null; 
    }
    setInputAnalyserNode(null);
    outputGainNodeRef.current = null; 
    reverbNodeRef.current = null;
    outputSourcesRef.current.forEach(source => { 
        try { source.stop(); } catch(e){}
        try { source.disconnect(); } catch(e){} 
    });
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  return {
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
  };
}
