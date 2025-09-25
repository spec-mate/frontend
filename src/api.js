import axios from "axios";

const api = axios.create({
  baseURL: "/api", // ✅ 프록시 경유 → CORS 문제 해결
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // Bearer 토큰 인증이면 false 권장
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⏰ AccessToken 만료, 재로그인이 필요합니다.");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
