import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
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
    const originalRequest = error.config;

    // AccessToken 만료 시 RefreshToken으로 재발급
    if (
      error.response &&
      [401, 403].includes(error.response.status) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.warn("🔄 AccessToken 만료 → RefreshToken으로 재발급 시도 중...");

      const refreshToken =
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("❌ RefreshToken 없음 → 재로그인 필요");
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // ✅ api 인스턴스로 호출해야 CORS/withCredentials 유지됨
        const res = await api.post(
          `/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
          null,
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          },
        );

        const newAccessToken = res.data.accessToken;

        if (!newAccessToken) {
          throw new Error("응답에 accessToken이 존재하지 않습니다.");
        }

        // ✅ 새 AccessToken 저장
        sessionStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        // ✅ axios 인스턴스 전역에도 새 토큰 반영
        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.info("✅ AccessToken 재발급 성공 → 원 요청 재시도");
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("🚫 토큰 재발급 실패 → 로그인 필요:", refreshErr);
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
