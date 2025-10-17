// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 프록시 경유
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // sessionStorage와 localStorage 모두 확인
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("AccessToken 만료됨, RefreshToken으로 갱신 시도");

      const refreshToken =
        sessionStorage.getItem("refreshToken") ||
        localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("RefreshToken 없음 → 로그인 필요");
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // ✅ Refresh API 호출
        const res = await axios.post(
          "/api/auth/refresh",
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAccessToken = res.data.accessToken;
        sessionStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        // 실패한 요청 재시도
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api.request(error.config);
      } catch (refreshErr) {
        console.error("토큰 재발급 실패 → 로그인 필요");
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ✅ WebSocket URL 생성 헬퍼 (토큰은 붙이지 않음)
export const getWebSocketUrl = (path = "/ws/chat") => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  let wsBaseUrl = apiBaseUrl.replace(/^http/, "ws").replace(/\/api\/?$/, "");

  if (wsBaseUrl.startsWith("ws://") && !wsBaseUrl.includes("localhost")) {
    wsBaseUrl = wsBaseUrl.replace("ws://", "wss://");
  }

  return `${wsBaseUrl}${path}`;
};
