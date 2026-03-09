import { useState, useEffect } from 'react';

export interface ApiConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
}

const STORAGE_KEY = 'voiceaura_api_config';

const DEFAULT_CONFIG: ApiConfig = {
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  apiKey: '',
  baseUrl: 'https://generativelanguage.googleapis.com'
};

export const useApiConfig = () => {
  const [config, setConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse API config', e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const updateConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  return { config, updateConfig };
};
