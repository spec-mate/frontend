// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ .env에서 불러옴
  headers: { "Content-Type": "application/json" },
});

// 🔹 요청 인터셉터: accessToken을 자동으로 Authorization 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 응답 인터셉터 (선택): 401 에러 → refreshToken 처리 가능
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized - accessToken 만료됨");
      // 여기서 refreshToken 갱신 로직 추가 가능
      // ex) const refresh = localStorage.getItem("refreshToken");
      // await api.post("/auth/refresh", { refresh });
    }
    return Promise.reject(error);
  }
);

export default api;
