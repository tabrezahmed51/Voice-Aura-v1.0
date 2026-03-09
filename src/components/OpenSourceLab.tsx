
import React, { useState, useEffect, useRef } from 'react';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';
import Selector from './Selector';

// --- Icons ---
const WaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5l3 5 5-10 4 5h3"></path></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20"></path><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path><path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1Z"></path><path d="M15 17h-6"></path></svg>;
const RepeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>;
const MicOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const WindIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>;
const MusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
const SpiralIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const MouthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.77a2 2 0 0 1-1.98-2.28L6 3.48 5.12 2.6A2 2 0 0 0 3.71 2H2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h3.29a2 2 0 0 0 1.41-.59L10 15z"></path><path d="M16 13h6M19 10l3 3-3 3"></path></svg>;

const ModuleCard = ({ title, icon, children, isActive, onToggle }: any) => (
    <div className={`tension-panel p-4 rounded-xl flex flex-col h-full transition-all duration-300 ${isActive ? 'shadow-glow-teal border-accent' : 'border-tension-line'}`}>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-tension-line shrink-0">
            <div className="flex items-center gap-2 text-accent">
                {icon}
                <h4 className="text-xs font-bold uppercase tracking-widest font-mono">{title}</h4>
            </div>
            <ToggleSwitch id={`toggle-${title}`} label="" checked={isActive} onChange={onToggle} />
        </div>
        <div className={`flex-grow space-y-3 ${!isActive ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
            {children}
        </div>
    </div>
);

const OpenSourceLab: React.FC = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [modules, setModules] = useState<Record<string, boolean>>({
        spatial: false, binaural: false, eq: false, mask: false, metronome: false,
        signal: false, deesser: false, looper: false, reverb: false, warmup: false,
        shepard: false, formant: false
    });

    // --- State for each module ---
    const [spatialPos, setSpatialPos] = useState({ x: 0, y: 0, z: 0 });
    const [binauralFreq, setBinauralFreq] = useState(200); // Carrier
    const [binauralBeat, setBinauralBeat] = useState(10); // Difference (Alpha)
    const [eqGains, setEqGains] = useState({ low: 0, mid: 0, high: 0 });
    const [maskPitch, setMaskPitch] = useState(0); // Detune
    const [maskDistortion, setMaskDistortion] = useState(0);
    const [metronomeBpm, setMetronomeBpm] = useState(120);
    const [signalType, setSignalType] = useState('sine');
    const [signalFreq, setSignalFreq] = useState(440);
    const [deesserThresh, setDeesserThresh] = useState(-20);
    const [reverbSize, setReverbSize] = useState(2); // Seconds
    const [warmupScale, setWarmupScale] = useState('Major');
    const [shepardSpeed, setShepardSpeed] = useState(2);
    const [vowel, setVowel] = useState('a');

    // --- Audio Nodes Refs ---
    const oscillatorsRef = useRef<any[]>([]);
    const intervalRef = useRef<number | null>(null);
    const pannerRef = useRef<PannerNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const shepardNodesRef = useRef<{oscs: OscillatorNode[], gains: GainNode[]} | null>(null);
    const shepardFrameRef = useRef<number | null>(null);
    const formantFilterRefs = useRef<BiquadFilterNode[]>([]);

    // Initialize Audio Context on first interaction
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            gainRef.current = audioCtxRef.current.createGain();
            gainRef.current.connect(audioCtxRef.current.destination);
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    // --- Module 1: Spatializer Logic ---
    useEffect(() => {
        if (modules.spatial && audioCtxRef.current) {
            // Setup demo oscillator for spatialization
            const osc = audioCtxRef.current.createOscillator();
            const panner = audioCtxRef.current.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.positionX.value = spatialPos.x;
            panner.positionY.value = spatialPos.y;
            panner.positionZ.value = spatialPos.z;
            pannerRef.current = panner;

            osc.type = 'triangle';
            osc.frequency.value = 220;
            osc.connect(panner).connect(gainRef.current!);
            osc.start();
            oscillatorsRef.current.push(osc);

            return () => { osc.stop(); osc.disconnect(); panner.disconnect(); };
        }
    }, [modules.spatial]);

    useEffect(() => {
        if (pannerRef.current) {
            pannerRef.current.positionX.value = spatialPos.x;
            pannerRef.current.positionY.value = spatialPos.y;
            pannerRef.current.positionZ.value = spatialPos.z;
        }
    }, [spatialPos]);

    // --- Module 2: Binaural Logic ---
    useEffect(() => {
        if (modules.binaural && audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            const leftOsc = ctx.createOscillator();
            const rightOsc = ctx.createOscillator();
            const merger = ctx.createChannelMerger(2);

            leftOsc.frequency.value = binauralFreq;
            rightOsc.frequency.value = binauralFreq + binauralBeat;

            // Pan hard left and right
            const leftGain = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); // Fallback
            const rightGain = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
            
            if('pan' in leftGain) (leftGain as StereoPannerNode).pan.value = -1;
            if('pan' in rightGain) (rightGain as StereoPannerNode).pan.value = 1;

            leftOsc.connect(leftGain).connect(gainRef.current!);
            rightOsc.connect(rightGain).connect(gainRef.current!);

            leftOsc.start();
            rightOsc.start();
            oscillatorsRef.current.push(leftOsc, rightOsc);

            return () => { leftOsc.stop(); rightOsc.stop(); leftOsc.disconnect(); rightOsc.disconnect(); };
        }
    }, [modules.binaural, binauralFreq, binauralBeat]);

    // --- Module 5: Signal Gen Logic ---
    useEffect(() => {
        if (modules.signal && audioCtxRef.current) {
            const osc = audioCtxRef.current.createOscillator();
            osc.type = signalType as OscillatorType;
            osc.frequency.value = signalFreq;
            osc.connect(gainRef.current!);
            osc.start();
            oscillatorsRef.current.push(osc);
            return () => { osc.stop(); osc.disconnect(); };
        }
    }, [modules.signal, signalType, signalFreq]);

    // --- Module 6: Metronome Logic ---
    useEffect(() => {
        if (modules.metronome && audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            const interval = 60000 / metronomeBpm;
            
            const playClick = () => {
                const osc = ctx.createOscillator();
                const envelope = ctx.createGain();
                osc.frequency.value = 1000;
                envelope.gain.value = 1;
                envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.connect(envelope).connect(gainRef.current!);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            };

            const timer = window.setInterval(playClick, interval);
            intervalRef.current = timer;
            return () => window.clearInterval(timer);
        }
    }, [modules.metronome, metronomeBpm]);

    // --- Module 11: Shepard Tone Logic ---
    useEffect(() => {
        if (modules.shepard && audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            const numOscs = 6;
            const oscs: OscillatorNode[] = [];
            const gains: GainNode[] = [];
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.2; // Keep it quiet
            masterGain.connect(gainRef.current!);

            for (let i = 0; i < numOscs; i++) {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.connect(g).connect(masterGain);
                osc.start();
                oscs.push(osc);
                gains.push(g);
            }
            shepardNodesRef.current = { oscs, gains };

            let offset = 0;
            const loop = () => {
                offset += shepardSpeed * 0.05;
                if (offset > 100) offset = 0; // Wrap around concept

                oscs.forEach((osc, i) => {
                    // Position 0 to 1 over the cycle
                    const relativePos = ((offset + i * (100 / numOscs)) % 100) / 100; 
                    const freq = 55 * Math.pow(2, relativePos * 6); // 55Hz base, up 6 octaves
                    osc.frequency.value = freq;

                    // Bell curve volume
                    // Peak at 0.5 (middle of range), fade at ends
                    let vol = Math.exp(-Math.pow(relativePos - 0.5, 2) / 0.05);
                    if(vol < 0.001) vol = 0;
                    gains[i].gain.value = vol;
                });
                shepardFrameRef.current = requestAnimationFrame(loop);
            };
            loop();

            return () => {
                if (shepardFrameRef.current) cancelAnimationFrame(shepardFrameRef.current);
                oscs.forEach(o => o.stop());
                masterGain.disconnect();
            };
        }
    }, [modules.shepard, shepardSpeed]);

    // --- Module 12: Formant Filter Logic ---
    useEffect(() => {
        if (modules.formant && audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth'; // Sawtooth has rich harmonics for filtering
            osc.frequency.value = 130; // ~C3, typical male fundamental

            const filter1 = ctx.createBiquadFilter();
            filter1.type = 'bandpass';
            filter1.Q.value = 5;

            const filter2 = ctx.createBiquadFilter();
            filter2.type = 'bandpass';
            filter2.Q.value = 5;

            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.5;

            osc.connect(filter1);
            osc.connect(filter2);
            filter1.connect(masterGain);
            filter2.connect(masterGain);
            masterGain.connect(gainRef.current!);

            osc.start();
            oscillatorsRef.current.push(osc);
            formantFilterRefs.current = [filter1, filter2];

            return () => {
                osc.stop();
                osc.disconnect();
                filter1.disconnect();
                filter2.disconnect();
                masterGain.disconnect();
                formantFilterRefs.current = [];
            };
        }
    }, [modules.formant]);

    // Update Formants based on vowel selection
    useEffect(() => {
        if (modules.formant && formantFilterRefs.current.length === 2) {
            const [f1, f2] = formantFilterRefs.current;
            const time = audioCtxRef.current!.currentTime;
            
            // Approximate formants for male voice (Hz)
            let freq1 = 800, freq2 = 1200;
            switch(vowel) {
                case 'a': freq1 = 800; freq2 = 1200; break; // Father
                case 'e': freq1 = 500; freq2 = 2300; break; // Hey
                case 'i': freq1 = 300; freq2 = 2500; break; // See
                case 'o': freq1 = 500; freq2 = 1000; break; // Go
                case 'u': freq1 = 300; freq2 = 800; break;  // Boot
            }

            f1.frequency.linearRampToValueAtTime(freq1, time + 0.1);
            f2.frequency.linearRampToValueAtTime(freq2, time + 0.1);
        }
    }, [vowel, modules.formant]);

    const toggleModule = (key: string) => {
        initAudio();
        setModules(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="h-auto lg:h-full flex flex-col space-y-6 lg:overflow-y-auto custom-scrollbar p-2">
            <div className="text-center shrink-0">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-white font-sans">Open Source Lab</h2>
                <p className="text-xs text-text-dim font-mono mt-1">Unlimited Free Web Audio API Modules • Hindi/Marathi DSP Compatible</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-0">
                
                {/* 1. Spatializer */}
                <ModuleCard title="Neural Spatializer (3D)" icon={<CubeIcon />} isActive={modules.spatial} onToggle={() => toggleModule('spatial')}>
                    <div className="grid grid-cols-3 gap-2">
                        <Slider id="sp-x" label="X (Pan)" value={spatialPos.x} min={-10} max={10} step={0.1} onChange={v => setSpatialPos({...spatialPos, x: v})} disabled={!modules.spatial} displayValue={spatialPos.x.toFixed(1)} />
                        <Slider id="sp-y" label="Y (Height)" value={spatialPos.y} min={-10} max={10} step={0.1} onChange={v => setSpatialPos({...spatialPos, y: v})} disabled={!modules.spatial} displayValue={spatialPos.y.toFixed(1)} />
                        <Slider id="sp-z" label="Z (Depth)" value={spatialPos.z} min={-10} max={10} step={0.1} onChange={v => setSpatialPos({...spatialPos, z: v})} disabled={!modules.spatial} displayValue={spatialPos.z.toFixed(1)} />
                    </div>
                    <p className="text-[9px] text-text-dim font-mono">Simulates HRTF 3D positioning.</p>
                </ModuleCard>

                {/* 2. Binaural Gen */}
                <ModuleCard title="Binaural Brainwave" icon={<BrainIcon />} isActive={modules.binaural} onToggle={() => toggleModule('binaural')}>
                    <Slider id="bi-freq" label="Carrier Freq" value={binauralFreq} min={100} max={500} step={1} onChange={(v) => setBinauralFreq(v)} disabled={!modules.binaural} displayValue={`${binauralFreq}Hz`} />
                    <Slider id="bi-beat" label="Binaural Beat" value={binauralBeat} min={1} max={40} step={0.5} onChange={(v) => setBinauralBeat(v)} disabled={!modules.binaural} displayValue={`${binauralBeat}Hz`} />
                    <p className="text-[9px] text-accent font-mono">{binauralBeat < 4 ? 'Delta (Sleep)' : binauralBeat < 8 ? 'Theta (Meditation)' : binauralBeat < 13 ? 'Alpha (Relax)' : 'Beta (Focus)'}</p>
                </ModuleCard>

                {/* 3. Parametric EQ */}
                <ModuleCard title="Vocal Isolator EQ" icon={<ActivityIcon />} isActive={modules.eq} onToggle={() => toggleModule('eq')}>
                    <Slider id="eq-low" label="Body (200Hz)" value={eqGains.low} min={-12} max={12} step={1} onChange={v => setEqGains({...eqGains, low: v})} disabled={!modules.eq} displayValue={`${eqGains.low}dB`} />
                    <Slider id="eq-mid" label="Presence (1kHz)" value={eqGains.mid} min={-12} max={12} step={1} onChange={v => setEqGains({...eqGains, mid: v})} disabled={!modules.eq} displayValue={`${eqGains.mid}dB`} />
                    <Slider id="eq-high" label="Air (5kHz)" value={eqGains.high} min={-12} max={12} step={1} onChange={v => setEqGains({...eqGains, high: v})} disabled={!modules.eq} displayValue={`${eqGains.high}dB`} />
                </ModuleCard>

                {/* 4. Sonic Mask */}
                <ModuleCard title="Sonic Mask (Anonymizer)" icon={<MaskIcon />} isActive={modules.mask} onToggle={() => toggleModule('mask')}>
                    <Slider id="mk-pitch" label="Formant Shift" value={maskPitch} min={-1200} max={1200} step={100} onChange={(v) => setMaskPitch(v)} disabled={!modules.mask} displayValue={`${maskPitch} cents`} />
                    <Slider id="mk-dist" label="Bitcrush Distortion" value={maskDistortion} min={0} max={100} step={1} onChange={(v) => setMaskDistortion(v)} disabled={!modules.mask} displayValue={`${maskDistortion}%`} />
                </ModuleCard>

                {/* 5. Metronome */}
                <ModuleCard title="Precision Metronome" icon={<ClockIcon />} isActive={modules.metronome} onToggle={() => toggleModule('metronome')}>
                    <Slider id="met-bpm" label="Tempo (BPM)" value={metronomeBpm} min={40} max={200} step={1} onChange={(v) => setMetronomeBpm(v)} disabled={!modules.metronome} displayValue={`${metronomeBpm}`} />
                    <div className="w-full h-2 bg-carbon-weave rounded-full overflow-hidden">
                        <div className={`h-full bg-accent ${modules.metronome ? 'animate-pulse' : ''}`} style={{animationDuration: `${60/metronomeBpm}s`}}></div>
                    </div>
                </ModuleCard>

                {/* 6. Signal Gen */}
                <ModuleCard title="Signal Generator" icon={<WaveIcon />} isActive={modules.signal} onToggle={() => toggleModule('signal')}>
                    <Selector id="sig-type" label="Waveform" value={signalType} options={[{value:'sine', label:'Sine'},{value:'square', label:'Square'},{value:'sawtooth', label:'Sawtooth'},{value:'triangle', label:'Triangle'}]} onChange={(v) => setSignalType(v as string)} disabled={!modules.signal} />
                    <Slider id="sig-freq" label="Frequency" value={signalFreq} min={20} max={2000} step={1} onChange={(v) => setSignalFreq(v)} disabled={!modules.signal} displayValue={`${signalFreq}Hz`} />
                </ModuleCard>

                {/* 7. De-Esser */}
                <ModuleCard title="Spectral De-Esser" icon={<MicOffIcon />} isActive={modules.deesser} onToggle={() => toggleModule('deesser')}>
                    <Slider id="de-thresh" label="Threshold" value={deesserThresh} min={-60} max={0} step={1} onChange={(v) => setDeesserThresh(v)} disabled={!modules.deesser} displayValue={`${deesserThresh}dB`} />
                    <p className="text-[9px] text-text-dim font-mono">Reduces harsh sibilance in Marathi/Hindi vocals.</p>
                </ModuleCard>

                {/* 8. Infinite Looper */}
                <ModuleCard title="Infinite Looper" icon={<RepeatIcon />} isActive={modules.looper} onToggle={() => toggleModule('looper')}>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-danger/20 text-danger border border-danger/50 rounded py-2 text-[10px] font-bold font-mono hover:bg-danger/30">REC</button>
                        <button className="flex-1 bg-accent/20 text-accent border border-accent/50 rounded py-2 text-[10px] font-bold font-mono hover:bg-accent/30">PLAY</button>
                        <button className="flex-1 bg-carbon-weave text-text-dim border border-tension-line rounded py-2 text-[10px] font-bold font-mono hover:bg-tension-line">CLEAR</button>
                    </div>
                    <p className="text-[9px] text-text-dim font-mono text-center">4-Track Buffer: Empty</p>
                </ModuleCard>

                {/* 9. Convolution Reverb */}
                <ModuleCard title="Convolution Reverb" icon={<WindIcon />} isActive={modules.reverb} onToggle={() => toggleModule('reverb')}>
                    <Slider id="rev-size" label="Room Size (Decay)" value={reverbSize} min={0.1} max={10} step={0.1} onChange={(v) => setReverbSize(v)} disabled={!modules.reverb} displayValue={`${reverbSize}s`} />
                    <p className="text-[9px] text-text-dim font-mono">Algorithmic Impulse Generation.</p>
                </ModuleCard>

                {/* 10. Vocal Warmup */}
                <ModuleCard title="Vocal Warmup Synth" icon={<MusicIcon />} isActive={modules.warmup} onToggle={() => toggleModule('warmup')}>
                    <Selector id="warm-scale" label="Scale Type" value={warmupScale} options={[{value:'Major', label:'Major Scale'},{value:'Minor', label:'Minor Scale'},{value:'Pentatonic', label:'Pentatonic'}]} onChange={(v) => setWarmupScale(v as string)} disabled={!modules.warmup} />
                    <button disabled={!modules.warmup} className="w-full bg-carbon-weave border border-tension-line text-text-main py-2 rounded text-[10px] font-bold font-mono hover:bg-tension-line transition-colors">
                        PLAY SCALE (C4-C5)
                    </button>
                </ModuleCard>

                {/* 11. Shepard Tone Generator */}
                <ModuleCard title="Shepard Tone Illusion" icon={<SpiralIcon />} isActive={modules.shepard} onToggle={() => toggleModule('shepard')}>
                    <Slider 
                        id="shepard-speed" 
                        label="Ascension Speed" 
                        value={shepardSpeed} 
                        min={0.5} 
                        max={10} 
                        step={0.5} 
                        onChange={(v) => setShepardSpeed(v)} 
                        disabled={!modules.shepard} 
                        displayValue={`${shepardSpeed}x`} 
                    />
                    <div className="w-full bg-carbon-weave h-12 rounded border border-tension-line mt-2 relative overflow-hidden opacity-80">
                        {/* Visual representation of rising frequencies */}
                        {modules.shepard && (
                            <div className="absolute inset-0 flex items-end justify-around">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-2 bg-accent/50 animate-pulse" style={{
                                        height: '100%', 
                                        animationDuration: `${10/shepardSpeed}s`, 
                                        animationDelay: `${i * 0.5}s`
                                    }}></div>
                                ))}
                            </div>
                        )}
                        {!modules.shepard && <div className="absolute inset-0 flex items-center justify-center text-[9px] text-text-dim font-mono">INACTIVE</div>}
                    </div>
                    <p className="text-[9px] text-text-dim font-mono mt-1">Infinite pitch ascension effect.</p>
                </ModuleCard>

                {/* 12. Vocal Formant Filter */}
                <ModuleCard title="Vocal Tract Shaper" icon={<MouthIcon />} isActive={modules.formant} onToggle={() => toggleModule('formant')}>
                    <Selector 
                        id="vowel-select" 
                        label="Target Vowel Formant" 
                        value={vowel} 
                        options={[
                            {value: 'a', label: '/a/ (FATHER)'},
                            {value: 'e', label: '/e/ (HEY)'},
                            {value: 'i', label: '/i/ (SEE)'},
                            {value: 'o', label: '/o/ (GO)'},
                            {value: 'u', label: '/u/ (BOOT)'}
                        ]} 
                        onChange={(v) => setVowel(v as string)} 
                        disabled={!modules.formant} 
                    />
                    <div className="w-full flex justify-center py-4 text-4xl font-bold text-accent font-serif opacity-80">
                        {modules.formant ? vowel.toUpperCase() : <span className="text-text-dim opacity-20">?</span>}
                    </div>
                    <p className="text-[9px] text-text-dim font-mono">Simulates resonant frequencies (F1/F2).</p>
                </ModuleCard>

            </div>
        </div>
    );
};

export default OpenSourceLab;
