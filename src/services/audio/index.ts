import { playSfx } from "./SfxPlayer";
import { playMusic, pauseMusic, toggleMusic, setMusicVolume, toggleMusicMute } from "./MusicPlayer";
import { playVoice } from "./VoicePlayer";
import type { AudioService } from "./AudioService";

export const audioService: AudioService = {
  playSfx,
  playMusic,
  pauseMusic,
  toggleMusic,
  setMusicVolume,
  toggleMusicMute,
  playVoice,
};

export type { SfxKey, PlaybackOptions, AudioService } from "./AudioService";
export { getState as getMusicState, subscribe as subscribeMusicState, initMusicPreferences } from "./MusicPlayer";
export type { MusicPlayerState } from "./MusicPlayer";
