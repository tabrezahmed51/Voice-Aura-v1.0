
import { Language, BaseVoice, Tone, Accent, Gender, VoiceStatus, VoicePriority, AICapability, VoiceCloneModel, AsrEngine, TTSEngine } from './types';

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'hi-IN', label: 'Hindi (Standard)' },
  { value: 'mr-IN', label: 'Marathi (Standard)' },
  { value: 'hi-Latn', label: 'Hindi (Romanized)' },
  { value: 'ur-Latn', label: 'Urdu (Romanized)' },
  { value: 'mr-Latn', label: 'Marathi (Romanized)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'it-IT', label: 'Italian (Italy)' },
  { value: 'ja-JP', label: 'Japanese (Japan)' },
  { value: 'ko-KR', label: 'Korean (South Korea)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ru-RU', label: 'Russian (Russia)' },
  { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { value: 'ta-IN', label: 'Tamil (India)' },
  { value: 'te-IN', label: 'Telugu (India)' },
  { value: 'kn-IN', label: 'Kannada (India)' },
  { value: 'gu-IN', label: 'Gujarati (India)' },
  { value: 'pa-IN', label: 'Punjabi (India)' },
  { value: 'bn-IN', label: 'Bengali (India)' },
  { value: 'pt-PT', label: 'Portuguese (Portugal)' },
  { value: 'nl-NL', label: 'Dutch (Netherlands)' },
  { value: 'tr-TR', label: 'Turkish (Turkey)' },
  { value: 'pl-PL', label: 'Polish (Poland)' },
  { value: 'sv-SE', label: 'Swedish (Sweden)' },
  { value: 'vi-VN', label: 'Vietnamese (Vietnam)' },
  { value: 'th-TH', label: 'Thai (Thailand)' },
  { value: 'id-ID', label: 'Indonesian (Indonesia)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'da-DK', label: 'Danish (Denmark)' },
  { value: 'fi-FI', label: 'Finnish (Finland)' },
  { value: 'no-NO', label: 'Norwegian (Norway)' },
  { value: 'cs-CZ', label: 'Czech (Czech Republic)' },
  { value: 'el-GR', label: 'Greek (Greece)' },
  { value: 'hu-HU', label: 'Hungarian (Hungary)' },
  { value: 'ro-RO', label: 'Romanian (Romania)' },
  { value: 'ms-MY', label: 'Malay (Malaysia)' },
  { value: 'tl-PH', label: 'Filipino (Philippines)' },
  { value: 'uk-UA', label: 'Ukrainian (Ukraine)' },
  { value: 'hr-HR', label: 'Croatian (Croatia)' },
  { value: 'sk-SK', label: 'Slovak (Slovakia)' },
  { value: 'bg-BG', label: 'Bulgarian (Bulgaria)' }
];

export const VOICE_CLONE_LANGUAGES = [
    { value: "en", label: "English" }, { value: "ja", label: "Japanese" }, { value: "zh", label: "Chinese" },
    { value: "de", label: "German" }, { value: "hi", label: "Hindi" }, { value: "fr", label: "French" },
    { value: "ko", label: "Korean" }, { value: "pt", label: "Portuguese" }, { value: "it", label: "Italian" },
    { value: "es", label: "Spanish" }, { value: "id", label: "Indonesian" }, { value: "nl", label: "Dutch" },
    { value: "tr", label: "Turkish" }, { value: "fil", label: "Filipino" }, { value: "pl", label: "Polish" },
    { value: "sv", label: "Swedish" }, { value: "bg", label: "Bulgarian" }, { value: "ro", label: "Romanian" },
    { value: "ar", label: "Arabic" }, { value: "cs", label: "Czech" }, { value: "el", label: "Greek" },
    { value: "fi", label: "Finnish" }, { value: "hr", label: "Croatian" }, { value: "ms", label: "Malay" },
    { value: "sk", label: "Slovak" }, { value: "da", label: "Danish" }, { value: "ta", label: "Tamil" },
    { value: "uk", label: "Ukrainian" }, { value: "ru", label: "Russian" }
];

export const VOICE_CLONE_MODELS: { value: VoiceCloneModel; label: string }[] = [
  { value: 'a2e', label: 'A2E (Optimized Eng/Ch)' },
  { value: 'cartesia', label: 'Cartesia (Multilingual)' },
  { value: 'minimax', label: 'Minimax (Fast Inference)' },
  { value: 'elevenlabs', label: 'ElevenLabs (Expressive)' }
];

export const TTS_ENGINES: { value: string; label: string }[] = [
  { value: 'gemini', label: 'Google Gemini 2.5 (Native)' },
  { value: 'speecht5', label: 'Microsoft SpeechT5 (Hugging Face API)' }
];

export const VOICES: { value: BaseVoice; label: string }[] = [
  { value: 'Kore', label: 'Kore (Female)' },
  { value: 'Puck', label: 'Puck (Male)' },
  { value: 'Charon', label: 'Charon (Male)' },
  { value: 'Fenrir', label: 'Fenrir (Male)' },
  { value: 'Zephyr', label: 'Zephyr (Female)' },
  { value: 'Liam', label: 'Liam (Male - Irish)' },
  { value: 'Sofia', label: 'Sofia (Female - Spanish)' },
  { value: 'Ravi', label: 'Ravi (Male - Indian)' }
];

export const TONES: { value: Tone; label: string }[] = [
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Warm', label: 'Warm' },
  { value: 'Formal', label: 'Formal' },
  { value: 'Energetic', label: 'Energetic' }
];

export const ACCENTS: { value: Accent; label: string }[] = [
  { value: 'Neutral', label: 'Neutral' },
  { value: 'American', label: 'American' },
  { value: 'British', label: 'British' },
  { value: 'Indian', label: 'Indian' }
];

export const GENDERS: { value: Gender; label: string }[] = [
    { value: 'Unspecified', label: 'Unspecified' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
];

export const SOUND_EFFECTS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'reverb', label: 'Cathedral Reverb' },
  { value: 'hall-reverb', label: 'Hall Reverb' },
  { value: 'spring-reverb', label: 'Spring Reverb' },
  { value: 'plate-reverb', label: 'Plate Reverb' },
  { value: 'echo', label: 'Echo Chamber' },
  { value: 'telephone', label: 'Telephone Distortion' },
  { value: 'robot', label: 'Robot Voice Filter' },
  { value: 'airport', label: 'Airport Environment' },
  { value: 'railway', label: 'Indian Railway Environment' }
];

export const MUSICAL_KEYS: { value: string; label: string }[] = [
    { value: 'C-Major', label: 'C Major / A Minor' },
    { value: 'G-Major', label: 'G Major / E Minor' },
    { value: 'D-Major', label: 'D Major / B Minor' },
    { value: 'A-Major', label: 'A Major / F# Minor' },
    { value: 'E-Major', label: 'E Major / C# Minor' },
    { value: 'B-Major', label: 'B Major / G# Minor' },
    { value: 'F#-Major', label: 'F# Major / D# Minor' },
    { value: 'C#-Major', label: 'C# Major / A# Minor' },
    { value: 'F-Major', label: 'F Major / D Minor' },
    { value: 'Bb-Major', label: 'Bb Major / G Minor' },
    { value: 'Eb-Major', label: 'Eb Major / C Minor' },
    { value: 'Ab-Major', label: 'Ab Major / F Minor' },
    { value: 'Db-Major', label: 'Db Major / Bb Minor' },
    { value: 'Gb-Major', label: 'Gb Major / Eb Minor' },
    { value: 'Cb-Major', label: 'Cb Major / Ab Minor' }
];


export const VOICE_STATUSES: { value: VoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Active' },
  { value: 'Ready', label: 'Ready' },
  { value: 'Archived', label: 'Archived' },
  { value: 'Deleted', label: 'Recycle Bin' }
];

export const VOICE_PRIORITIES: { value: VoicePriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

export const VOICE_STATUS_OPTIONS: { value: VoiceStatus; label: string }[] = [
    { value: 'Ready', label: 'Ready' },
    { value: 'Archived', label: 'Archived' }
];

export const VOICE_PRIORITY_OPTIONS: { value: VoicePriority; label: string }[] = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
];

export const GOOGLE_DRIVE_BACKUP_DAYS: { value: string; label: string }[] = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday'}
];

export const GOOGLE_DRIVE_BACKUP_TIMES: { value: string; label: string }[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export const NEMOTRON_CHUNK_OPTIONS = [
    { value: 80, label: 'Low Latency (80ms)', context: '[70, 0]' },
    { value: 160, label: 'Balanced (160ms)', context: '[150, 0]' },
    { value: 560, label: 'High Throughput (560ms)', context: '[550, 0]' },
    { value: 1120, label: 'Max Context (1120ms)', context: '[1110, 0]' }
];

export const ASR_ENGINES: { value: AsrEngine; label: string }[] = [
  { value: 'gemini-native', label: 'Gemini (Native)' },
  { value: 'nemotron-cache-aware', label: 'Nemotron (Cache-Aware)' }
];

export const AI_PROVIDER_OPTIONS: { value: string; label: string; capabilities: AICapability[] }[] = [
  { value: 'Google', label: 'Google (Gemini 2.5/Pro/Flash)', capabilities: ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'] },
  { value: 'OpenAI', label: 'OpenAI (GPT-4o/Mini)', capabilities: ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'] },
  { value: 'Anthropic', label: 'Anthropic (Claude 3.5 Sonnet)', capabilities: ['Chat', 'Reasoning', 'Vision', 'Coding'] },
  { value: 'Microsoft', label: 'Microsoft Azure AI', capabilities: ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'] },
  { value: 'AWS', label: 'AWS Bedrock', capabilities: ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'] },
  { value: 'ElevenLabs', label: 'ElevenLabs (Voice Synthesis)', capabilities: ['TTS'] },
  { value: 'OpenRouter', label: 'OpenRouter (Venice/Llama 3/Mistral)', capabilities: ['Chat', 'Reasoning', 'Vision', 'Coding', 'TTS', 'Image'] },
  { value: 'Groq', label: 'Groq (Llama 3 70B - Fast)', capabilities: ['Chat', 'Reasoning', 'Coding'] },
  { value: 'TogetherAI', label: 'Together AI (Mixtral/Qwen)', capabilities: ['Chat', 'Reasoning', 'Coding'] },
  { value: 'HuggingFace', label: 'HuggingFace (Inference API)', capabilities: ['Chat', 'Reasoning', 'Vision', 'Image', 'TTS', 'ASR'] },
  { value: 'Mistral', label: 'Mistral AI (Large/Small)', capabilities: ['Chat', 'Reasoning', 'Coding'] },
  { value: 'DeepSeek', label: 'DeepSeek (Coder/Chat)', capabilities: ['Chat', 'Reasoning', 'Coding'] },
  { value: 'Cohere', label: 'Cohere (Command R+)', capabilities: ['Chat', 'Reasoning'] },
  { value: 'Perplexity', label: 'Perplexity (Online LLM)', capabilities: ['Chat', 'Reasoning', 'Vision'] },
  { value: 'Replicate', label: 'Replicate (Flux/SDXL)', capabilities: ['Image', 'Vision'] }
];

export const HF_API_KEY = typeof process !== 'undefined' && process.env ? (process.env.HF_API_KEY || '') : '';
