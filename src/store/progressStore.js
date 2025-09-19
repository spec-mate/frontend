// src/store/progressStore.js
import { create } from "zustand";

export const useProgressStore = create((set) => ({
  progress: 0, // ✅ 초기값
  setProgress: (value) => set({ progress: value }), // ✅ 직접 설정
  increaseProgress: (step = 10) =>
    set((state) => ({ progress: Math.min(state.progress + step, 100) })), // ✅ 증가
  resetProgress: () => set({ progress: 0 }), // ✅ 초기화
}));
