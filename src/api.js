import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ✅ 공통 토큰 로더
export const getAccessToken = () =>
  sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
export const getRefreshToken = () =>
  sessionStorage.getItem("refreshToken") ||
  localStorage.getItem("refreshToken");

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
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
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
          null,
          { withCredentials: true },
        );

        console.log("🔁 Refresh 응답:", res.data);

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error("accessToken 누락됨");

        localStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("accessToken", newAccessToken);

        // ✅ 새 토큰 반영
        api.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.info("✅ AccessToken 재발급 성공 → 원 요청 재시도");

        // ✅ 약간의 딜레이 (필터 갱신 문제 방지)
        await new Promise((r) => setTimeout(r, 150));

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
  },
);

export default api;
