
import { useState, useEffect } from 'react';
import { UserPreferences, ClonedVoice, APIProvider, Preset } from '../types';

export function useUserPreferences() {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
        const res = JSON.parse(localStorage.getItem('userPreferences') || 'null');
        return res || {
            favoriteLanguages: ['en-US', 'hi-IN', 'mr-IN'],
            defaultInputLanguage: 'en-US',
            defaultResponseLanguage: 'en-US',
            autoDetectEnabled: true
        };
    } catch {
        return {
            favoriteLanguages: ['en-US', 'hi-IN', 'mr-IN'],
            defaultInputLanguage: 'en-US',
            defaultResponseLanguage: 'en-US',
            autoDetectEnabled: true
        };
    }
  });

  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>(() => {
    try { 
        const res = JSON.parse(localStorage.getItem('clonedVoices') || '[]'); 
        return Array.isArray(res) ? res : [];
    } catch { return []; }
  });

  const [apiProviders, setApiProviders] = useState<APIProvider[]>(() => {
    try { 
        const res = JSON.parse(localStorage.getItem('apiProviders') || '[]'); 
        return Array.isArray(res) ? res : [];
    } catch { return []; }
  });

  const [presets, setPresets] = useState<Preset[]>(() => {
    try { 
        const res = JSON.parse(localStorage.getItem('userPresets') || '[]'); 
        return Array.isArray(res) ? res : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem('clonedVoices', JSON.stringify(clonedVoices));
  }, [clonedVoices]);

  useEffect(() => {
    localStorage.setItem('apiProviders', JSON.stringify(apiProviders));
  }, [apiProviders]);

  useEffect(() => {
    localStorage.setItem('userPresets', JSON.stringify(presets));
  }, [presets]);

  return {
    userPreferences, setUserPreferences,
    clonedVoices, setClonedVoices,
    apiProviders, setApiProviders,
    presets, setPresets
  };
}
