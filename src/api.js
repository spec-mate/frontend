import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ============================================================
// 🔹 Access / Refresh Token Getter
// ============================================================
export const getAccessToken = () =>
  sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

export const getRefreshToken = () =>
  sessionStorage.getItem("refreshToken") ||
  localStorage.getItem("refreshToken");

// ============================================================
// 🔹 Request Interceptor
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 🔹 Response Interceptor (403 / 401 자동 Refresh)
// ============================================================
api.interceptors.response.use(
  (response) => response, // 정상 응답 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;

    // --------------------------------------------------------
    // 401 / 403 발생 + 아직 retry 안함 → Refresh 토큰 시도
    // --------------------------------------------------------
    if (status && [401, 403].includes(status) && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn("🔄 AccessToken 만료 → RefreshToken으로 재발급 시도 중...");

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.error("❌ RefreshToken 없음 → 재로그인 필요");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // 🔄 Refresh Token 요청
        const res = await axios.post(
          `/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
          null,
          { withCredentials: true }
        );

        console.log("🔁 Refresh 응답:", res.data);

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        if (!newAccessToken) {
          throw new Error("accessToken 누락됨");
        }

        // --------------------------------------------------------
        // 🔹 Token 저장 (localStorage + sessionStorage)
        // --------------------------------------------------------
        localStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("accessToken", newAccessToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
          sessionStorage.setItem("refreshToken", newRefreshToken);
        }

        // --------------------------------------------------------
        // 🔹 Axios 기본 헤더 & 원 요청 헤더 업데이트
        // --------------------------------------------------------
        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.info("✅ AccessToken 재발급 성공 → 원 요청 재시도");

        // --------------------------------------------------------
        // 🔥 핵심 해결: Axios 재시도 시 method가 GET으로 바뀌는 버그 방지
        // --------------------------------------------------------
        if (originalRequest.method) {
          originalRequest.method = originalRequest.method.toLowerCase();
        }

        // 필터 토큰 업데이트 반영 시 약간의 딜레이
        await new Promise((resolve) => setTimeout(resolve, 120));

        return api(originalRequest);
      } catch (refreshErr) {
        console.error("🚫 토큰 재발급 실패 → 재로그인 필요:", refreshErr);

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
