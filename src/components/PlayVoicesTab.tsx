
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PlayVoicesSettings, ClonedVoice, BaseVoice, VoiceAnalysis, Language, AudioFormat } from '../types';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import AudioPlayer from './AudioPlayer';
import Selector from './Selector';
import ToggleSwitch from './ToggleSwitch';
import { VOICES, LANGUAGES } from '../constants';

interface PlayVoicesTabProps {
  clonedVoices: ClonedVoice[];
  playVoicesSettings: PlayVoicesSettings;
  setPlayVoicesSettings: React.Dispatch<React.SetStateAction<PlayVoicesSettings>>;
  onUploadPlayVoice: (file: File | null) => void;
  onEnhancePlayVoice: () => void;
  onResetPlayVoices: () => void;
  isAppBusy: boolean;
  ai: GoogleGenAI; 
  decode: (base64: string) => Uint8Array;
  decodeAudioData: (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => Promise<AudioBuffer>;
  sinkId?: string;
  onToggleAudioHub: () => void;
  isAudioHubOpen: boolean;
  outputFormat: AudioFormat; 
}

const PlayVoicesTab: React.FC<PlayVoicesTabProps> = ({
  clonedVoices,
  playVoicesSettings,
  setPlayVoicesSettings,
  onUploadPlayVoice,
  onEnhancePlayVoice,
  onResetPlayVoices,
  isAppBusy,
  ai, 
  decode, 
  decodeAudioData, 
  sinkId,
  onToggleAudioHub,
  isAudioHubOpen,
  outputFormat 
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState('Neutral');
  const [activeScenario, setActiveScenario] = useState('None');
  const [generatedTakes, setGeneratedTakes] = useState<{id: number, audio: AudioBuffer, label: string}[]>([]);
  const [isEnhancingScript, setIsEnhancingScript] = useState(false);
  const [scriptLanguage, setScriptLanguage] = useState<Language>('en-US'); 

  // Scenario Templates
  const scenarios = [
      { label: "None", value: "None" },
      { label: "Noir Detective", value: "Noir Detective", prompt: "Speak in a gritty, cynical tone like a 1940s private investigator. Use short sentences." },
      { label: "Sci-Fi AI", value: "Sci-Fi AI", prompt: "Speak in a calm, slightly metallic and logical tone. Highly precise articulation." },
      { label: "Hyped Streamer", value: "Hyped Streamer", prompt: "Speak with high energy, fast pace, and excitement! Use gamer slang." },
      { label: "Sleepy Storytime", value: "Sleepy Storytime", prompt: "Speak in a very slow, soft, and soothing whisper. Maximum calmness." },
  ];

  // Emotions
  const emotions = ["Neutral", "Happy", "Sad", "Angry", "Fear", "Whisper", "Shout", "Sarcastic"];

  const handleScenarioChange = (scenarioValue: string) => {
      setActiveScenario(scenarioValue);
      const scenario = scenarios.find(s => s.value === scenarioValue);
      if (scenario && scenario.value !== 'None') {
          setPlayVoicesSettings(prev => ({ ...prev, prompt: `[${scenario.label} Mode]: ` + prev.prompt.replace(/^\[.*\]: /, '') }));
      }
  };

  const handleEnhanceScript = async () => {
      if (!playVoicesSettings.prompt.trim()) return;
      setIsEnhancingScript(true);
      try {
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview', 
              contents: { parts: [{ text: `Rewrite the following text to be more dramatic and engaging for a voice actor performing a ${selectedEmotion} scene: "${playVoicesSettings.prompt}"` }] }
          });
          if(response.candidates?.[0]?.content?.parts?.[0]?.text) {
              setPlayVoicesSettings(prev => ({ ...prev, prompt: response.candidates![0]!.content!.parts![0]!.text! }));
          }
      } catch(e) {
          console.error(e);
      } finally {
          setIsEnhancingScript(false);
      }
  };

  const handleDirectorAction = async () => {
      onEnhancePlayVoice();
  };

  useEffect(() => {
      if (playVoicesSettings.enhancedVoiceBuffer) {
          setGeneratedTakes(prev => [
              { 
                  id: Date.now(), 
                  audio: playVoicesSettings.enhancedVoiceBuffer!, 
                  label: `Take ${prev.length + 1} - ${selectedEmotion} - ${activeScenario}` 
              },
              ...prev
          ]);
      }
  }, [playVoicesSettings.enhancedVoiceBuffer, activeScenario, selectedEmotion]);


  const combinedVoiceOptions = useMemo(() => [
    { label: "Google Pre-built Voices", options: VOICES },
    { label: "Your Cloned Voices", options: (clonedVoices || []).filter(v => v.status === 'Ready').map(v => ({ value: v.name, label: v.name })) }
  ], [clonedVoices]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:h-full h-auto overflow-hidden">
      
      {/* 1. Director's Console (Left) */}
      <div className="tension-panel w-full xl:w-80 flex flex-col gap-5 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar rounded-xl">
          <div>
              <h3 className="text-lg font-bold text-text-main font-sans mb-1">Director's Console</h3>
              <p className="text-xs text-text-dim font-mono">Configure your voice actor.</p>
          </div>

          <div className="space-y-4">
              <Selector
                id="voice-actor-select"
                label="Lead Voice Actor"
                value={playVoicesSettings.selectedVoiceId}
                options={combinedVoiceOptions}
                onChange={(val) => setPlayVoicesSettings(prev => ({ ...prev, selectedVoiceId: val }))}
                disabled={isAppBusy}
              />

              <div className="bg-carbon-base p-3 rounded-lg border border-tension-line">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider mb-3 block font-mono">Method Acting (Emotion)</label>
                  <div className="grid grid-cols-2 gap-2">
                      {emotions.map(emo => (
                          <button
                            key={emo}
                            onClick={() => setSelectedEmotion(emo)}
                            className={`py-2 px-1 text-[10px] sm:text-xs rounded-md border transition-all font-mono ${selectedEmotion === emo ? 'bg-accent text-carbon-base border-accent shadow-[0_0_10px_var(--accent-dim)]' : 'bg-carbon-weave text-text-dim border-tension-line hover:bg-tension-line'}`}
                          >
                              {emo.toUpperCase()}
                          </button>
                      ))}
                  </div>
              </div>

              <Selector
                id="scenario-select"
                label="Scenario Context"
                value={activeScenario}
                options={scenarios.map(s => ({ value: s.value, label: s.label }))}
                onChange={handleScenarioChange}
                disabled={isAppBusy}
              />
          </div>
          
          <div className="mt-auto">
             <button
                onClick={onResetPlayVoices}
                className="w-full py-2 text-xs text-text-dim hover:text-text-main border border-tension-line rounded hover:bg-carbon-weave transition-colors font-mono"
             >
                 RESET STAGE
             </button>
          </div>
      </div>

      {/* 2. The Script (Center) */}
      <div className="tension-panel flex-grow flex flex-col rounded-xl h-auto lg:h-full">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-main flex items-center gap-2 font-sans">
                  <span className="text-2xl">📜</span> The Script
              </h3>
              <button 
                onClick={handleEnhanceScript}
                disabled={isEnhancingScript || isAppBusy}
                className="text-xs bg-accent-dim text-accent border border-accent-dim px-3 py-1.5 rounded hover:bg-accent/20 transition-colors flex items-center gap-2 font-mono"
              >
                  {isEnhancingScript ? ' REWRITING...' : '✨ AI POLISH SCRIPT'}
              </button>
          </div>

          <div className="flex-grow relative group min-h-[200px]">
              <textarea
                value={playVoicesSettings.prompt}
                onChange={(e) => setPlayVoicesSettings(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter your script here... Use [brackets] for stage directions."
                className="w-full h-full bg-carbon-base text-text-main p-6 rounded-lg border-2 border-tension-line focus:border-accent focus:ring-0 resize-none font-sans text-lg leading-relaxed shadow-inner transition-all focus:bg-carbon-weave"
                disabled={isAppBusy}
              />
              <div className="absolute bottom-4 right-4 text-xs text-text-dim bg-carbon-base/50 px-2 py-1 rounded pointer-events-none font-mono">
                  {playVoicesSettings.prompt.length} chars
              </div>
          </div>
          <div className="mt-4">
             <Selector id="script-language" label="Script Language" value={scriptLanguage} options={LANGUAGES} onChange={(val) => setScriptLanguage(val as Language)} disabled={isAppBusy} />
          </div>

          <div className="mt-4 flex justify-end">
              <button
                onClick={handleDirectorAction}
                disabled={isAppBusy || playVoicesSettings.processing || !playVoicesSettings.prompt.trim()}
                className="bg-danger hover:bg-danger/80 text-carbon-base font-bold py-3 px-8 rounded-full shadow-[0_0_20px_var(--danger)] disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 flex items-center gap-2 font-mono"
              >
                  {playVoicesSettings.processing ? (
                      <span className="animate-pulse">RECORDING...</span>
                  ) : (
                      <>
                        <div className="w-3 h-3 bg-carbon-base rounded-full"></div>
                        ACTION
                      </>
                  )}
              </button>
          </div>
          
          {playVoicesSettings.error && (
              <div className="mt-2 text-center text-danger text-xs bg-danger/20 p-2 rounded font-mono">
                  {playVoicesSettings.error}
              </div>
          )}
      </div>

      {/* 3. The Booth (Right) */}
      <div className="tension-panel w-full xl:w-80 flex flex-col rounded-xl overflow-hidden h-auto lg:h-full">
          <div className="p-4 border-b border-tension-line bg-carbon-weave">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider font-mono">Session Takes</h3>
          </div>
          <div className="flex-grow lg:overflow-y-auto custom-scrollbar p-3 space-y-3">
              {generatedTakes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-dim opacity-50 space-y-2 font-mono py-10 lg:py-0">
                      <div className="text-4xl">🎬</div>
                      <p className="text-xs">No takes recorded yet.</p>
                  </div>
              ) : (
                  generatedTakes.map((take) => (
                      <div key={take.id} className="bg-carbon-base border border-tension-line rounded-lg p-2 hover:border-carbon-weave transition-colors">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-text-dim truncate max-w-[150px] font-mono">{take.label}</span>
                              <span className="text-[9px] text-text-dim font-mono">{new Date(take.id).toLocaleTimeString()}</span>
                          </div>
                          <AudioPlayer 
                            audioBuffer={take.audio} 
                            title="" 
                            sinkId={sinkId} 
                            format={outputFormat}
                          />
                      </div>
                  ))
              )}
          </div>
      </div>

    </div>
  );
};

export default PlayVoicesTab;
