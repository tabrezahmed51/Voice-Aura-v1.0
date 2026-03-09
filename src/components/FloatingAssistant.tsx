
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, APIProvider, Language } from '../types';
import Selector from './Selector';
import { LANGUAGES, HF_API_KEY } from '../constants';

interface FloatingAssistantProps {
  apiProviders: APIProvider[];
  chatInputValue: string;
  onChatInputValueChange: (value: string) => void;
  onAgentCommand?: (command: string) => void;
}

const VeniceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
);

const GammaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
);

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);

const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MaximizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const AttachIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;
const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-danger animate-pulse" : ""}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ apiProviders, chatInputValue, onChatInputValueChange, onAgentCommand }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', role: 'assistant', content: 'Systems online. Select "MOLTBOT" for autonomous agent control.', timestamp: Date.now() }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('moltbot');
  const [assistantLanguage, setAssistantLanguage] = useState<Language>('en-US');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized, isTyping]);

  // Construct options for model selector
  const modelOptions = [
      { value: 'moltbot', label: '⭐ MOLTBOT (Autonomous Agent)' },
      { value: 'default', label: 'System Default (Gemini 2.5)' },
      { value: 'gemini-pro', label: 'Gemini 3 Pro' },
      { value: 'gpt-4', label: 'GPT-4 (Simulated/BYOK)' },
      { value: 'mistral-large', label: 'Mistral Large' },
      { value: 'google-gamma', label: 'Google Gamma (Gemma 2)' },
      { value: 'venice-ai-hf', label: 'VENICE AI Uncensored' },
      ...apiProviders.map(p => ({ value: p.id, label: `${p.name} (${p.provider})` }))
  ];

  const callAI = async (prompt: string): Promise<string> => {
      const provider = apiProviders.find(p => p.id === selectedProviderId);
      const systemPrompt = `You are Aura, an expert AI embedded in the 'Voice Aura' application. 
      You specialize in audio engineering, voice synthesis, DSP (Digital Signal Processing), and Python coding for audio. 
      
      CRITICAL CAPABILITY: MICRO-DEPTH ANALYSIS.
      You are capable of analyzing voice nuances, pitch contours, and spectral data with extreme precision.
      You have native-level proficiency in Hindi, Marathi, and Nepali phonetics. 
      When asked about these languages, provide detailed phonetic breakdown and topological analysis of the audio.
      
      Provide concise, technical, and accurate answers. Be helpful and cyberpunk-themed in tone.`;

      // 1. MOLTBOT (Default: Hugging Face with Gemini Fallback)
      if (selectedProviderId === 'moltbot') {
          if (onAgentCommand) onAgentCommand(prompt);

          // Attempt HF if key is present
          if (HF_API_KEY) {
              try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 5000);

                  const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                      method: "POST",
                      headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
                      body: JSON.stringify({
                          inputs: `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`,
                          parameters: { max_new_tokens: 512, return_full_text: false, temperature: 0.7 }
                      }),
                      signal: controller.signal
                  });
                  clearTimeout(timeoutId);

                  if (!response.ok) throw new Error(`Status ${response.status}`);
                  const data = await response.json();
                  if (Array.isArray(data) && data[0]?.generated_text) return `[MOLTBOT]: ${data[0].generated_text.trim()}`;
                  throw new Error("Invalid response");
              } catch (hfError: any) {
                  console.warn("MoltBot HF Error, falling back to Gemini:", hfError);
                  // Fall through to Gemini
              }
          }

          // Fallback to Gemini
          try {
              const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
              if (!apiKey) return "System Error: No Identity Token (API Key) found.";

              const ai = new GoogleGenAI({ apiKey });
              
              // Add timeout to Gemini call
              const response = await Promise.race([
                  ai.models.generateContent({
                      model: 'gemini-3-flash-preview',
                      contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\nUser Query: " + prompt }] }]
                  }),
                  new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Gemini API Timeout")), 10000))
              ]);

              return `[MOLTBOT/Fallback]: ${response.text || "No text"}`;
          } catch (geminiError: any) {
              return `MoltBot System Error: ${geminiError.message}`;
          }
      }

      // 2. VENICE AI (Hugging Face)
      if (selectedProviderId === 'venice-ai-hf') {
          if (!HF_API_KEY) return "Error: HF_API_KEY missing.";
          try {
              const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
                  body: JSON.stringify({
                      inputs: `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`,
                      parameters: { max_new_tokens: 512, return_full_text: false, temperature: 0.7 }
                  })
              });
              if (!response.ok) return `Venice Connection Failed (${response.status})`;
              const data = await response.json();
              return Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text.trim() : "Venice returned no data.";
          } catch (e: any) { return `Venice Error: ${e.message}`; }
      }

      // 3. Google Gemini Pro
      if (selectedProviderId === 'gemini-pro') {
          const key = process.env.API_KEY;
          if (!key) return "Error: Google API Key required.";
          try {
              const ai = new GoogleGenAI({ apiKey: key });
              const response = await ai.models.generateContent({
                  model: 'gemini-3-pro-preview',
                  contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + prompt }] }]
              });
              return response.text || "No content returned.";
          } catch (e: any) { return `Gemini Pro Error: ${e.message}`; }
      }

      // 4. Mistral Large (Via HF)
      if (selectedProviderId === 'mistral-large') {
          if (!HF_API_KEY) return "Error: HF_API_KEY required for Mistral.";
          try {
              const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
                  body: JSON.stringify({
                      inputs: `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`,
                      parameters: { max_new_tokens: 512, return_full_text: false }
                  })
              });
              const data = await response.json();
              return Array.isArray(data) && data[0]?.generated_text ? `[Mistral]: ${data[0].generated_text.trim()}` : "Mistral error.";
          } catch (e: any) { return `Mistral Error: ${e.message}`; }
      }

      // 5. GPT-4 (Simulated or BYOK)
      if (selectedProviderId === 'gpt-4') {
          const provider = apiProviders.find(p => p.provider === 'OpenAI');
          if (provider && provider.key) {
             return "[GPT-4 (BYOK)]: Integration pending backend proxy. Using simulated response: I understand your request regarding audio synthesis.";
          }
          return "[GPT-4 Simulation]: This feature requires a valid OpenAI API key in Settings > Nexus Hub. Currently running in simulation mode.";
      }

      // 6. Google Gamma (Gemma) & Default
      if (selectedProviderId === 'default' || selectedProviderId === 'google-gamma' || provider?.provider === 'Google') {
          const key = (selectedProviderId === 'default' || selectedProviderId === 'google-gamma') ? process.env.API_KEY : provider?.key;
          if (!key) return "Error: No API Key found.";
          
          try {
              const ai = new GoogleGenAI({ apiKey: key });
              const model = selectedProviderId === 'google-gamma' ? 'gemma-2-9b-it' : 'gemini-3-flash-preview';
              // Check if model exists or fallback
              try {
                  const response = await ai.models.generateContent({
                      model: model,
                      contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + prompt }] }]
                  });
                  return response.text || "No response.";
              } catch(e) {
                  const response = await ai.models.generateContent({
                      model: 'gemini-3-flash-preview',
                      contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + prompt }] }]
                  });
                  return response.text || "No response (Fallback).";
              }
          } catch (e: any) { return `Gemini Error: ${e.message}`; }
      }

      return "System Error: Neural Interface Unlinked.";
  };

  const handleSendMessage = async () => {
    if (!chatInputValue.trim()) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: chatInputValue,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    onChatInputValueChange('');
    setIsTyping(true);

    try {
        const responseText = await callAI(userMsg.content);
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Critical Failure in Neural Link.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const userMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'user',
              content: `Analyzing file: ${file.name}`,
              timestamp: Date.now(),
              attachments: [{ name: file.name, type: file.type, url: URL.createObjectURL(file) }]
          };
          setMessages(prev => [...prev, userMsg]);
          setIsTyping(true);
          setTimeout(() => {
              setMessages(prev => [...prev, {
                  id: (Date.now()+1).toString(),
                  role: 'assistant',
                  content: `File ${file.name} ingested. Format: ${file.type || 'Unknown'}. Ready for spectral decomposition.`,
                  timestamp: Date.now()
              }]);
              setIsTyping(false);
          }, 1500);
      }
  };

  if (!isOpen) return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent rounded-full shadow-[0_0_20px_var(--accent-dim)] flex items-center justify-center text-carbon-base hover:scale-110 transition-transform z-50 animate-pulse-fast border border-text-main/20"
        title="Open AI Assistant"
      >
          <VeniceIcon />
      </button>
  );

  if (isMinimized) return (
      <div className="fixed bottom-6 right-6 w-64 bg-bg border border-accent-dim rounded-t-lg shadow-2xl z-50 overflow-hidden">
          <div 
            className="flex justify-between items-center p-3 bg-accent-dim cursor-pointer"
            onClick={() => setIsMinimized(false)}
          >
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="font-bold text-xs text-accent uppercase tracking-wider font-mono">
                      {selectedProviderId === 'moltbot' ? 'MoltBot Active' : 'Aura Live'}
                  </span>
              </div>
              <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setIsMinimized(false); }} className="text-text-dim hover:text-text-main"><MaximizeIcon /></button>
                  <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-text-dim hover:text-danger"><CloseIcon /></button>
              </div>
          </div>
      </div>
  );

  return (
    <div className={`fixed z-50 transition-all duration-300 ease-in-out bg-bg/95 backdrop-blur-md border border-accent-dim shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden rounded-xl
        ${isExpanded ? 'top-20 right-4 bottom-4 left-4 sm:left-auto sm:w-[500px]' : 'bottom-6 right-6 w-[350px] h-[500px]'}
    `}>
      {/* Header */}
      <div className="p-3 bg-accent-dim border-b border-accent/20 flex justify-between items-center shrink-0 handle cursor-move">
          <div className="flex items-center gap-2">
              <span className="text-accent">
                  {selectedProviderId === 'google-gamma' ? <GammaIcon /> : selectedProviderId === 'moltbot' ? <BotIcon /> : <VeniceIcon />}
              </span>
              <div className="flex flex-col">
                  <span className="font-bold text-sm text-text-main leading-none font-sans">
                      {selectedProviderId === 'venice-ai-hf' ? 'VENICE AI' : selectedProviderId === 'moltbot' ? 'MOLTBOT' : 'AURA AI'}
                  </span>
                  <span className="text-[9px] text-text-dim font-mono">
                      {selectedProviderId === 'moltbot' ? 'AUTONOMOUS' : 'ASSISTANT'}
                  </span>
              </div>
          </div>
          <div className="flex items-center gap-1.5">
              <button onClick={() => setIsMinimized(true)} className="p-1.5 text-text-dim hover:text-text-main hover:bg-carbon-weave rounded transition-colors"><MinimizeIcon /></button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-text-dim hover:text-text-main hover:bg-carbon-weave rounded transition-colors"><MaximizeIcon /></button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-text-dim hover:text-danger hover:bg-danger/20 rounded transition-colors"><CloseIcon /></button>
          </div>
      </div>

      {/* Model Indicator & Lang */}
      <div className="bg-carbon-base border-b border-tension-line px-3 py-2 flex flex-col gap-2">
          <div className="w-full">
             <Selector 
                id="assistant-model"
                label=""
                value={selectedProviderId}
                options={modelOptions}
                onChange={(val) => setSelectedProviderId(val as string)}
             />
          </div>
          <div className="w-full">
             <Selector 
                id="assistant-lang" 
                label="" 
                value={assistantLanguage} 
                options={LANGUAGES} 
                onChange={(val) => setAssistantLanguage(val as Language)} 
                disabled={false}
             />
          </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-carbon-base">
          {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm font-sans ${
                      msg.role === 'user' 
                      ? 'bg-accent text-carbon-base rounded-br-none shadow-[0_0_15px_var(--accent-dim)]' 
                      : 'bg-carbon-weave text-text-main rounded-bl-none border border-tension-line'
                  }`}>
                      {msg.role === 'assistant' && <div className="text-[9px] font-bold text-accent mb-1 uppercase font-mono">{selectedProviderId === 'moltbot' ? 'MoltBot' : 'Aura'}</div>}
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                      {msg.attachments && (
                          <div className="mt-2 p-2 bg-bg/20 rounded border border-tension-line flex items-center gap-2">
                              <AttachIcon />
                              <span className="text-xs truncate max-w-[150px] font-mono">{msg.attachments[0].name}</span>
                          </div>
                      )}
                      <div className="text-[8px] text-text-main/40 mt-1 text-right font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
              </div>
          ))}
          {isTyping && (
              <div className="flex justify-start">
                  <div className="bg-carbon-weave p-3 rounded-lg rounded-bl-none border border-tension-line flex gap-1">
                      <span className="w-1.5 h-1.5 bg-text-dim rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-text-dim rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-text-dim rounded-full animate-bounce delay-200"></span>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-carbon-base border-t border-accent-dim shrink-0">
          <div className="relative flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="audio/*,image/*,text/*" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-text-dim hover:text-accent transition-colors"
                title="Attach File"
              >
                  <AttachIcon />
              </button>
              
              <div className="flex-grow flex gap-2 items-center">
                  <input
                    type="text"
                    value={chatInputValue}
                    onChange={(e) => onChatInputValueChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={selectedProviderId === 'moltbot' ? "Enter Command..." : "Query Neural Matrix..."}
                    className="w-full bg-black border border-tension-line/30 text-accent text-xs rounded-full py-2.5 px-4 focus:outline-none focus:border-accent focus:shadow-[0_0_10px_var(--accent-dim)] transition-all shadow-inner font-mono placeholder:text-text-dim/50"
                  />
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2.5 rounded-full border transition-all shadow-lg shrink-0 ${isRecording ? 'bg-danger/10 border-danger text-danger animate-pulse shadow-[0_0_15px_var(--danger)]' : 'bg-black border-tension-line/30 text-text-dim hover:text-accent hover:border-accent hover:shadow-[0_0_10px_var(--accent-dim)]'}`}
                    title="Voice Chat"
                  >
                      <MicIcon active={isRecording} />
                  </button>
              </div>

              <button 
                onClick={handleSendMessage}
                disabled={!chatInputValue.trim()}
                className="p-2.5 bg-accent hover:bg-accent-dim text-carbon-base rounded-full transition-all shadow-[0_0_10px_var(--accent-dim)] disabled:opacity-50 disabled:shadow-none"
              >
                  <SendIcon />
              </button>
          </div>
          {isRecording && <p className="text-[9px] text-danger text-center mt-1 animate-pulse font-mono">Listening... (Live Audio Stream Active)</p>}
      </div>
    </div>
  );
};

export default FloatingAssistant;
