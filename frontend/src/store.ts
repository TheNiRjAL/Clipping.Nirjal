import { create } from 'zustand';
import { Job, ClipSettings, Clip } from '../types';

interface AppStore {
  currentJob: Job | null;
  setCurrentJob: (job: Job | null) => void;
  updateJobProgress: (jobId: string, progress: number, status: string, task: string) => void;
  clips: Clip[];
  setClips: (clips: Clip[]) => void;
  settings: ClipSettings | null;
  setSettings: (settings: ClipSettings) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentJob: null,
  setCurrentJob: (job) => set({ currentJob: job }),
  updateJobProgress: (jobId, progress, status, task) =>
    set((state) => {
      if (state.currentJob?.jobId === jobId) {
        return {
          currentJob: {
            ...state.currentJob,
            progress,
            status: status as any,
            currentTask: task,
          },
        };
      }
      return state;
    }),
  clips: [],
  setClips: (clips) => set({ clips }),
  settings: null,
  setSettings: (settings) => set({ settings }),
}));
