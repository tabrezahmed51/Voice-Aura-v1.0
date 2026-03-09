
import React from 'react';
import { Language, UserPreferences } from '../types';
import { LANGUAGES } from '../constants';

interface LanguageManagerProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={filled ? "text-accent" : "text-text-dim"}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const LanguageManager: React.FC<LanguageManagerProps> = ({ preferences, onUpdatePreferences }) => {
  const toggleFavorite = (lang: Language) => {
    const isFavorite = preferences.favoriteLanguages.includes(lang);
    const newFavorites = isFavorite
      ? preferences.favoriteLanguages.filter(l => l !== lang)
      : [...preferences.favoriteLanguages, lang];
    
    onUpdatePreferences({ ...preferences, favoriteLanguages: newFavorites });
  };

  const setAsDefaultInput = (lang: Language) => {
    onUpdatePreferences({ ...preferences, defaultInputLanguage: lang });
  };

  const setAsDefaultResponse = (lang: Language) => {
    onUpdatePreferences({ ...preferences, defaultResponseLanguage: lang });
  };

  return (
    <div className="flex flex-col h-full bg-carbon-base rounded-2xl border border-tension-line overflow-hidden animate-fade-in shadow-2xl">
      <div className="p-6 border-b border-tension-line bg-carbon-weave/30 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-text-main tracking-tight font-sans">Language Ecosystem</h2>
          <p className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-mono">Global Mimicry Node Management</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-[9px] text-text-dim uppercase font-mono">Auto-Detect Status</span>
                <span className={`text-[10px] font-bold font-mono ${preferences.autoDetectEnabled ? 'text-success' : 'text-danger'}`}>
                    {preferences.autoDetectEnabled ? 'ACTIVE' : 'DISABLED'}
                </span>
            </div>
            <button 
                onClick={() => onUpdatePreferences({ ...preferences, autoDetectEnabled: !preferences.autoDetectEnabled })}
                className={`w-10 h-5 rounded-full relative transition-colors ${preferences.autoDetectEnabled ? 'bg-success/20 border border-success/40' : 'bg-carbon-weave border border-white/10'}`}
            >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${preferences.autoDetectEnabled ? 'right-0.5 bg-success' : 'left-0.5 bg-text-dim'}`}></div>
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const isFavorite = preferences.favoriteLanguages.includes(lang.value);
            const isDefaultInput = preferences.defaultInputLanguage === lang.value;
            const isDefaultResponse = preferences.defaultResponseLanguage === lang.value;

            return (
              <div 
                key={lang.value} 
                className={`p-4 rounded-xl border transition-all group ${
                    isFavorite ? 'bg-accent/5 border-accent/30 shadow-glow-teal' : 'bg-carbon-weave/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-main font-sans">{lang.label}</span>
                    <span className="text-[9px] text-text-dim font-mono uppercase tracking-widest">{lang.value}</span>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(lang.value)}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <StarIcon filled={isFavorite} />
                  </button>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setAsDefaultInput(lang.value)}
                    className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-tighter rounded-lg border transition-all ${
                        isDefaultInput 
                        ? 'bg-accent text-carbon-base border-accent' 
                        : 'bg-black/20 text-text-dim border-white/5 hover:border-accent/50 hover:text-accent'
                    }`}
                  >
                    {isDefaultInput ? 'Default Input' : 'Set Input'}
                  </button>
                  <button 
                    onClick={() => setAsDefaultResponse(lang.value)}
                    className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-tighter rounded-lg border transition-all ${
                        isDefaultResponse 
                        ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                        : 'bg-black/20 text-text-dim border-white/5 hover:border-purple-500/50 hover:text-purple-400'
                    }`}
                  >
                    {isDefaultResponse ? 'Default Resp' : 'Set Resp'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-tension-line bg-carbon-weave/10">
          <div className="flex items-center gap-3 text-text-dim">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </div>
              <p className="text-[10px] font-mono leading-relaxed">
                  Pinned languages will appear at the top of selection menus in the Mimicry Agent and Speech Studio. 
                  Default settings are persisted locally and applied automatically on session initialization.
              </p>
          </div>
      </div>
    </div>
  );
};

export default LanguageManager;
