import { create } from "zustand";

export const useHeaderStore = create((set) => ({
  headerVersion: "black",
  setHeaderVersion: (version) => set({ headerVersion: version }),
}));
