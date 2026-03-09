import React, { useState, useRef, useEffect } from 'react';
import Slider from './Slider';
import TextInput from './TextInput';
import RecordingControlBar from './RecordingControlBar';
import AudioPlayer from './AudioPlayer';
import Selector from './Selector';
import { ClonedVoice, AudioFormat } from '../types';
import { VOICES } from '../constants';

interface LivePodcastModalProps {
  open: boolean;
  onClose: () => void;
  clonedVoices?: ClonedVoice[]; 
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
);

const LivePodcastModal: React.FC<LivePodcastModalProps> = ({ open, onClose, clonedVoices = [] }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<AudioBuffer | null>(null);
  const [volume, setVolume] = useState(80);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Default');
  const [transcriptionLines, setTranscriptionLines] = useState<{id: number, speaker: string, text: string}[]>([]);
  const [transcriptPaused, setTranscriptPaused] = useState(false);
  const [outputFormat, setOutputFormat] = useState<AudioFormat>('wav'); 
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const mockTranscriptionIntervalRef = useRef<number | null>(null);


  useEffect(() => {
      if (!open) {
          setRecordedAudio(null);
          setIsRecording(false);
          setIsPaused(false);
          setTranscriptionLines([]);
          audioChunksRef.current = [];
          if (mockTranscriptionIntervalRef.current) {
            clearInterval(mockTranscriptionIntervalRef.current);
            mockTranscriptionIntervalRef.current = null;
          }
      }
  }, [open]);

  useEffect(() => {
      if (transcriptEndRef.current) {
          transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [transcriptionLines]);

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
        setIsPaused(false);
        setRecordedAudio(null);
        setTranscriptionLines([]);
        setTranscriptPaused(false);
        
        mockTranscriptionIntervalRef.current = window.setInterval(() => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive' || transcriptPaused) {
                return;
            }
            const phrases = [
                "Welcome back to the Voice Aura podcast.", 
                "Today we are diving deep into the realm of AI and its impact on human creativity.", 
                "Can you hear me clearly, Jane?", 
                "Yes, Joe, your audio levels are perfectly balanced. The spectral dynamics are quite impressive.", 
                "Indeed. The Gemini 3.5 model is providing real-time voice mimicry for both our outputs.",
                "It’s fascinating how it adapts to subtle nuances in tone and inflection. It's almost indistinguishable from a native speaker.",
                "Absolutely. This technology truly blur the line between synthetic and organic communication.",
                "So, what's your take on the ethical implications of such advanced mimicry?",
                "That's a complex question, requiring careful deliberation. Transparency and consent are paramount.",
                "Agreed. As powerful as this is, responsible development is key to its adoption.",
                "And on that thought-provoking note, we'll wrap up today's segment. Thank you for tuning in!"
            ];
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            const speaker = (transcriptionLines.length % 2 === 0) ? 'Host (Joe)' : 'Guest (Jane)'; 
            setTranscriptionLines(prev => [...prev, { id: Date.now(), speaker, text: randomPhrase }]);
        }, 2500); 

    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access denied.");
    }
  };

  const handlePauseRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause();
          setIsPaused(true);
          setTranscriptPaused(true);
      }
  };

  const handleResumeRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
          setIsPaused(false);
          setTranscriptPaused(false);
      }
  };

  const handleStopRecording = () => {
      if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const arrayBuffer = await audioBlob.arrayBuffer();
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              setRecordedAudio(audioBuffer);
              setIsRecording(false);
              setIsPaused(false);
              setTranscriptPaused(false);
              
              if (mockTranscriptionIntervalRef.current) {
                clearInterval(mockTranscriptionIntervalRef.current);
                mockTranscriptionIntervalRef.current = null;
              }
              mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          };
      }
  };

  const handleCancelRecording = () => {
      if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setIsPaused(false);
      setTranscriptPaused(false);
      audioChunksRef.current = [];
      setRecordedAudio(null);
      setTranscriptionLines([]);
      if (mockTranscriptionIntervalRef.current) {
        clearInterval(mockTranscriptionIntervalRef.current);
        mockTranscriptionIntervalRef.current = null;
      }
  };

  const handleRestartRecording = () => {
      handleCancelRecording();
      setTimeout(handleStartRecording, 100);
  };

  const voiceOptions = [
      { value: 'Default', label: 'My Natural Voice' },
      { label: "Pre-built AI Voices", options: VOICES },
      { label: "Cloned Voices", options: clonedVoices.map(v => ({ value: v.name, label: v.name })) }
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
      <div className="bg-bg w-full max-w-4xl rounded-xl border border-tension-line shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-tension-line flex justify-between items-center bg-carbon-base shrink-0">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2 font-sans">
            <span className="w-3 h-3 bg-danger rounded-full animate-pulse"></span>
            Live Podcast Studio
          </h2>
          <button 
            onClick={onClose}
            className="text-text-dim hover:text-text-main transition-colors p-1 rounded-full hover:bg-carbon-weave"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Left Column: Controls */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-tension-line">
                <div className="bg-carbon-base p-4 rounded-lg border border-tension-line shadow-inner">
                    <h3 className="text-sm font-semibold text-text-dim mb-4 uppercase tracking-wide font-mono">Recording Console</h3>
                    
                    <div className="mb-4">
                        <Selector
                            id="podcast-voice"
                            label="Voice Transformation (Real-time Mimicry)"
                            value={selectedVoice}
                            options={voiceOptions}
                            onChange={(val) => setSelectedVoice(val as string)}
                            disabled={isRecording}
                        />
                    </div>

                    {isRecording ? (
                        <RecordingControlBar
                            isPaused={isPaused}
                            onPause={handlePauseRecording}
                            onResume={handleResumeRecording}
                            onStop={handleStopRecording}
                            onCancel={handleCancelRecording}
                            onRestart={handleRestartRecording}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            {!recordedAudio && (
                                <button
                                    onClick={handleStartRecording}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg font-bold text-sm transition-all shadow-lg bg-accent hover:bg-accent-dim text-carbon-base shadow-accent-dim font-mono"
                                >
                                    <MicIcon /> START NEW RECORDING
                                </button>
                            )}
                            
                            {recordedAudio && (
                                <div className="space-y-3 animate-fade-in">
                                    <AudioPlayer audioBuffer={recordedAudio} title="Podcast Recording" onDelete={() => setRecordedAudio(null)} format={outputFormat} />
                                    <div className="flex justify-between items-center mt-2">
                                        <button 
                                            onClick={handleStartRecording} 
                                            className="text-xs text-text-dim hover:text-text-main underline font-mono"
                                        >
                                            DISCARD & RECORD NEW
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="px-1 mt-4">
                        <Slider
                            id="volume-slider"
                            label="Monitor Volume"
                            value={volume}
                            min={0}
                            max={100}
                            step={1}
                            onChange={setVolume}
                            disabled={false}
                            displayValue={`${volume}%`}
                        />
                    </div>
                     <div className="mb-4">
                         <Selector
                            id="podcast-output-format"
                            label="Output Format"
                            value={outputFormat}
                            options={[{value: 'wav', label: 'WAV'}, {value: 'webm', label: 'WebM'}, {value: 'mp3', label: 'MP3'}]}
                            onChange={(val) => setOutputFormat(val as AudioFormat)}
                            disabled={isRecording || !recordedAudio}
                         />
                     </div>
                </div>

                {/* Metadata Fields */}
                <div className="space-y-4">
                    <TextInput
                    id="podcast-title"
                    label="Podcast Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The AI Revolution"
                    disabled={false}
                    />
                    <TextInput
                    id="podcast-desc"
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of this episode..."
                    disabled={false}
                    isTextArea={true}
                    rows={4}
                    />
                </div>
            </div>

            {/* Right Column: Transcript & Publish */}
            <div className="flex-1 p-6 bg-carbon-base flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-text-dim uppercase tracking-wide font-mono">Live Transcript</h3>
                    {isRecording && !transcriptPaused && <span className="text-[10px] text-danger animate-pulse font-mono">● LIVE</span>}
                    {isRecording && transcriptPaused && <span className="text-[10px] text-yellow-500 animate-pulse font-mono">● PAUSED</span>}
                </div>
                
                <div className="flex-grow bg-carbon-weave rounded-lg border border-tension-line p-4 overflow-y-auto custom-scrollbar font-sans shadow-inner relative">
                    {transcriptionLines.length > 0 ? (
                        <div className="space-y-3">
                            {transcriptionLines.map((line) => (
                                <div key={line.id} className="animate-fade-in">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block font-mono ${line.speaker === 'Host (Joe)' ? 'text-accent' : 'text-success'}`}>
                                        {line.speaker}
                                    </span>
                                    <p className="text-text-main text-sm leading-relaxed font-sans">{line.text}</p>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-dim italic opacity-50 font-mono">
                            <p>No transcript available.</p>
                            <p className="text-xs">Start recording to see live captions.</p>
                        </div>
                    )}
                </div>

                 {/* Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-tension-line">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-text-dim hover:text-text-main hover:bg-carbon-weave transition-colors text-sm font-semibold font-mono"
                    >
                        CANCEL
                    </button>
                    <button 
                        disabled={!recordedAudio || !title.trim()}
                        className="px-6 py-2 rounded-lg bg-accent hover:bg-accent-dim disabled:bg-carbon-base disabled:text-text-dim disabled:cursor-not-allowed text-carbon-base font-bold text-sm shadow-lg shadow-accent-dim transition-all flex items-center gap-2 font-mono"
                    >
                        <span>🚀</span> PUBLISH PODCAST
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LivePodcastModal;