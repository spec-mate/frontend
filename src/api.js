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

// 🔹 응답 인터셉터: 401 처리 (토큰 만료 시)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⏰ AccessToken 만료, 재로그인이 필요합니다.");
      // 👉 여기서 refreshToken 로직을 추가하거나,
      // 로그인 페이지로 강제 이동하는 로직을 넣을 수 있음
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
