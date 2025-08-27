import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Difficulty } from '../types';

interface SettingsStore extends Settings {
  setExchangeRate: (rate: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setUiMode: (mode: "grid" | "menu") => void;
}

const defaultSettings: Settings = {
  exchangeRate: 1400,
  difficulty: "medium",
  uiMode: "grid"
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setExchangeRate: (rate: number) => 
        set({ exchangeRate: rate }),
      
      setDifficulty: (difficulty: Difficulty) => 
        set({ difficulty }),
      

      
      setUiMode: (mode: "grid" | "menu") => 
        set({ uiMode: mode }),
    }),
    {
      name: 'brain-train-settings',
    }
  )
);
