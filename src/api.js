import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 프록시 경유 → CORS 문제 해결
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // Bearer 토큰 인증이면 false 권장
});

// 요청 인터셉터
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

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("AccessToken 만료됨, RefreshToken으로 갱신 시도");

      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("RefreshToken 없음 → 로그인 필요");
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Refresh API 호출
        const res = await axios.post("/api/auth/refresh", null, {
          params: { refreshToken },
          headers: { "Content-Type": "application/json" },
        });

        const newAccessToken = res.data.accessToken;
        sessionStorage.setItem("accessToken", newAccessToken);

        // 실패한 요청 다시 시도
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api.request(error.config);
      } catch (refreshErr) {
        console.error("토큰 재발급 실패 → 로그인 필요");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
