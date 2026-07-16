import { create } from "zustand";
import type { AppSettings, Language } from "@/types";
import { storageService } from "@/services/storage";

const SETTINGS_KEY = "settings";

const defaultSettings: AppSettings = {
  language: "es",
  theme: "light", // Modo Oscuro: preparado en tailwind.config.js (darkMode: "class"), sin toggle todavía
  gameMode: "standard", // "study" y "competitive" preparados en types/settings.ts, sin lógica todavía
  audio: {
    sfxEnabled: true,
    musicEnabled: false, // sin efecto hasta que exista MusicPlayer real
    voiceEnabled: false, // sin efecto hasta que exista VoicePlayer real
    sfxVolume: 0.8,
    musicVolume: 0.5,
    voiceVolume: 0.8,
  },
  sync: {
    provider: "local", // cambia a "cloud" cuando CloudStorageAdapter esté implementado
  },
};

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  load: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setSfxEnabled: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoaded: false,

  load: async () => {
    const stored = await storageService.get<AppSettings>(SETTINGS_KEY);
    set({ settings: stored ?? defaultSettings, isLoaded: true });
  },

  setLanguage: async (language) => {
    const next = { ...get().settings, language };
    set({ settings: next });
    await storageService.set(SETTINGS_KEY, next);
  },

  setSfxEnabled: async (sfxEnabled) => {
    const next = { ...get().settings, audio: { ...get().settings.audio, sfxEnabled } };
    set({ settings: next });
    await storageService.set(SETTINGS_KEY, next);
  },
}));
