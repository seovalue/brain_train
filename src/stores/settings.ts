import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Difficulty } from '../types';

interface SettingsStore extends Settings {
  setExchangeRate: (rate: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setUiMode: (mode: "grid" | "menu") => void;
  setQuestionCount: (count: 3 | 5 | 7 | 10) => void;
}

const defaultSettings: Settings = {
  exchangeRate: 1400,
  difficulty: "easy",
  uiMode: "grid",
  questionCount: 5
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
      
      setQuestionCount: (count: 3 | 5 | 7 | 10) => 
        set({ questionCount: count }),
    }),
    {
      name: 'brain-train-settings',
    }
  )
);
