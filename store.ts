import { create } from 'zustand';
import { TreeState } from './types';

interface AppState {
  viewState: TreeState;
  setViewState: (state: TreeState) => void;
  toggleViewState: () => void;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
}

export const useStore = create<AppState>((set) => ({
  viewState: TreeState.SCATTERED,
  setViewState: (viewState) => set({ viewState }),
  toggleViewState: () => set((state) => ({
    viewState: state.viewState === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
  })),
  isAudioPlaying: false,
  toggleAudio: () => set((state) => ({ isAudioPlaying: !state.isAudioPlaying })),
}));
