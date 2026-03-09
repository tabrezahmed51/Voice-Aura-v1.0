
export type Language = 
  | 'en-US' | 'hi-IN' | 'mr-IN' | 'hi-Latn' | 'ur-Latn' | 'mr-Latn' 
  | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'ja-JP' | 'ko-KR' 
  | 'pt-BR' | 'zh-CN' | 'ru-RU' | 'ar-SA' | 'ta-IN' | 'te-IN' 
  | 'kn-IN' | 'gu-IN' | 'pa-IN' | 'bn-IN'
  | 'pt-PT' | 'nl-NL' | 'tr-TR' | 'pl-PL' | 'sv-SE' | 'vi-VN' | 'th-TH' | 'id-ID'
  | 'zh-TW' | 'da-DK' | 'fi-FI' | 'no-NO' | 'cs-CZ' | 'el-GR' | 'hu-HU' | 'ro-RO'
  | 'ms-MY' | 'tl-PH' | 'uk-UA' | 'hr-HR' | 'sk-SK' | 'bg-BG';

export interface UserPreferences {
  favoriteLanguages: Language[];
  defaultInputLanguage: Language;
  defaultResponseLanguage: Language;
  autoDetectEnabled: boolean;
}

export type Voice = string; 
export type BaseVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' | 'Liam' | 'Sofia' | 'Ravi';
export type Tone = 'Warm' | 'Formal' | 'Energetic' | 'Neutral';
export type Accent = 'American' | 'British' | 'Indian' | 'Neutral';
export type Gender = 'Male' | 'Female' | 'Unspecified';
export type VoiceCloneModel = 'a2e' | 'cartesia' | 'minimax' | 'elevenlabs';

export type VoiceStatus = 'Ready' | 'Archived' | 'Deleted' | 'Processing' | 'Failed';
export type VoicePriority = 'High' | 'Medium' | 'Low';

export type AudioFormat = 'wav' | 'webm' | 'mp3';
export type InspectionStatus = 'idle' | 'inspecting' | 'reprocessing' | 'verified' | 'failed';

export type AsrEngine = 'gemini-native' | 'nemotron-cache-aware';
export type NemotronChunkSize = 80 | 160 | 560 | 1120;

export type TTSEngine = 'gemini' | 'speecht5';

export interface AsrConfig {
    engine: AsrEngine;
    chunkSize: NemotronChunkSize;
    enablePnC: boolean;
    enableITN: boolean;
    beamSearchWidth?: number;
    lmInfluence?: number;
}

export interface TranscriptionSegment {
    id: string;
    text: string;
    timestamp: string;
    isFinal: boolean;
}

export interface ClonedVoice {
  name: string;
  baseVoice: BaseVoice;
  gender: Gender;
  createdAt: string;
  accent: Accent;
  tone: Tone;
  status: VoiceStatus;
  priority: VoicePriority;
  notes?: string;
  rating?: number;
  id?: string;
}

export interface VoiceAnalysis {
  emotion: string;
  style: string;
  pitch?: string;
  tone?: string;
  accent?: string;
  qualityScore?: number;
  hasClipping?: boolean;
}

export interface WaveformRegion {
  start: number; // 0 to 1 (percentage of width)
  end: number;   // 0 to 1
  color: string;
  label?: string;
}

export interface RealtimeMetrics {
    pitch: string | null;
    energy: string | null;
    jitter: number; 
    shimmer: number; 
    glottalization: number; 
}

export interface SoundEffect {
  name: string;
  url: string; 
  isCustom: boolean;
}

export interface WordAnalysis {
    word: string;
    score: number;
    errorType?: 'intonation' | 'stress' | 'mispronunciation' | 'none';
    details?: string;
    phonemes?: string[];
    stressPattern?: string;
    intonation?: string;
    suggestion?: string;
}

export interface PronunciationAnalysis {
    accuracy: string;
    suggestions: string[];
    feedback?: string;
    wordScores?: WordAnalysis[];
}

export enum AppStatus {
  IDLE,
  RECORDING,
  ANALYZING,
  MIMICKING,
  PAUSED,
  FINISHED,
  HEALING, 
}

export type ActiveTab = 'mimic' | 'speech-studio' | 'clone' | 'autotune' | 'play-voices' | 'settings' | 'data' | 'open-source' | 'live-translation' | 'agent-core' | 'moltbot' | 'languages' | 'asr';

export interface Preset {
  name: string;
  type: ActiveTab;
  voice?: Voice; 
  language?: Language;
  inputLanguage?: Language;
  mimicPitch?: number; 
  mimicSpeakingRate?: number; 
  mimicIntensity?: number;
  mimicTone?: Tone; 
  mimicAccent?: Accent; 
  mimicMode?: 'repeat' | 'conversation';
  selectedSoundEffect?: string;
  ttsText?: string;
  ttsLanguage?: Language;
  ttsVoice?: Voice; 
  ttsMode?: 'single' | 'multi';
  speakers?: SpeakerConfig[];
  ttsPitch?: number;
  ttsSpeakingRate?: number;
  ttsTone?: Tone;
  ttsAccent?: Accent;
  useSsml?: boolean;
  ttsEngine?: TTSEngine;
  cloneName?: string;
  cloneBaseVoice?: BaseVoice;
  cloneGender?: Gender;
  cloneAccent?: Accent;
  cloneTone?: Tone;
  autotuneEnabled?: boolean;
  autotuneKey?: string;
  autotuneAmount?: number;
  autotuneHumanize?: number;
  autotuneVibrato?: number;
  playVoicesPrompt?: string;
  playVoicesVoiceSource?: 'uploaded' | 'cloned' | 'prebuilt';
  playVoicesSelectedVoice?: Voice;
  translationSourceLang?: Language;
  translationTargetLang?: Language;
  translationUseVenice?: boolean;
  translationTtsVoice?: Voice;
  asrConfig?: AsrConfig;
}

export interface SpeakerConfig {
  id: string;
  name: string;
  voice: BaseVoice;
  pitch: number;
  rate: number;
}

export type ErrorSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SystemLog {
  id: string;
  severity: ErrorSeverity;
  timestamp: string;
  message: string;
  autoFixState: 'IDLE' | 'PATCHING' | 'RESOLVED' | 'FAILED';
  resolved: boolean;
  fixProgress: number;
  assignedAgent?: 'System Monitor' | 'Coder-Programmer Reasoner AI' | 'Deepseek R1 AI' | 'Voice Aura Guardian' | 'MoltBot Prime'; 
  codeSnippet?: string; 
}

export type AICapability = 'Chat' | 'Reasoning' | 'Vision' | 'Coding' | 'TTS' | 'Image' | 'ASR';

export interface APIProvider {
  id: string;
  name: string;
  provider: 'OpenRouter' | 'OpenAI' | 'Google' | 'Anthropic' | 'Mistral' | 'ElevenLabs' | 'HuggingFace' | 'Groq' | 'TogetherAI' | 'Perplexity' | 'Cohere' | 'DeepSeek' | 'Azure' | 'AWS' | 'Replicate' | 'Microsoft' | 'NVIDIA'; 
  key: string;
  capabilities: AICapability[];
  balance: {
    total: number;
    used: number;
    currency: string;
    renewalDate: string;
  };
  status: 'Active' | 'Inactive' | 'Error';
}

export interface NeuralinkProvider { 
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Error' | 'Standby';
  signalStrength: number;
  latencyMs: number;
  firmwareVersion: string;
}

export interface PodcastSettings {
  mimicVoiceId: string | 'uploaded'; 
  uploadedVoiceFile: File | null;
  uploadedVoiceBuffer: AudioBuffer | null;
  uploadedVoiceAnalysis: Partial<VoiceAnalysis> | null;
  inputLanguage: Language;
  responseLanguage: Language;
  aiTipMessage: string;
}

export enum PodcastStatus {
  IDLE,
  RECORDING,
  ANALYZING_VOICE,
  LIVE_STREAMING,
  FINISHED,
  ERROR,
}

export interface PlayVoicesSettings {
  prompt: string;
  uploadedVoiceFile: File | null;
  uploadedVoiceBuffer: AudioBuffer | null;
  uploadedVoiceAnalysis: Partial<VoiceAnalysis> | null;
  enhancedVoiceBuffer: AudioBuffer | null;
  processing: boolean;
  error: string | null;
  mimicryAttemptAnalysis: string | null; 
  selectedVoiceId: string; 
  voiceSourceType: 'uploaded' | 'cloned' | 'prebuilt';
}

export interface GoogleDriveBackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'manual';
  dayOfWeek: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  backupTime: string; 
  lastBackup: string | null;
  isBackingUp: boolean;
  backupStatus: string;
  backupProgress: number;
}

export interface AudioInputConfig {
  deviceId: string;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  gain: number;
}

export interface AudioOutputConfig {
  deviceId: string;
  masterVolume: number;
}

export interface DashboardMetrics {
  totalTokensUsed: number;
  totalVoiceGenerationSeconds: number;
  activeProvidersCount: number;
  totalFiles: number;
  storageUsedBytes: number;
  apiLatencyMs: number;
  systemHealth: number;
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface TranslationFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  date: string;
  deleted: boolean;
}

export interface AgentAction {
    id: string;
    timestamp: number;
    module: string;
    description: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface AgentState {
    status: 'idle' | 'listening' | 'thinking' | 'executing' | 'speaking';
    mode: 'autonomous' | 'manual';
    confidence: number;
    currentTask: string | null;
    actions: AgentAction[];
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const MAX_PRONUNCIATION_TEXT_FOR_ANALYSIS = 500;