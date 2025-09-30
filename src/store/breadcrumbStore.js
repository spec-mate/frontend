// src/store/breadcrumbStore.js
import { create } from "zustand";

export const useBreadcrumbStore = create((set) => ({
  path: [], // ex: [{label: "PC 부품 정보", link: "/info"}, {label: "CPU", link: "/product/cpu"}, {label: "Ryzen 5600X"}]
  setPath: (newPath) => set({ path: newPath }),
  resetPath: () => set({ path: [] }),
}));
