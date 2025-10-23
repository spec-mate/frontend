// src/api.js
import axios from "axios";

// ✅ Axios 인스턴스 생성
const api = axios.create({
  baseURL: "/api", // Vite proxy or Nginx rewrite 기준
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ 중요: 쿠키(RefreshToken) 자동 전송
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // sessionStorage 또는 localStorage에서 AccessToken 읽기
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

    // AccessToken 만료 시 (401 또는 403)
    if (
      error.response &&
      [401, 403].includes(error.response.status) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 무한 루프 방지
      console.warn("🔄 AccessToken 만료 → RefreshToken으로 갱신 시도 중...");

      const refreshToken =
        sessionStorage.getItem("refreshToken") ||
        localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("❌ RefreshToken 없음 → 재로그인 필요");
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
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // ✅ 쿠키 전달
          },
        );

        // ✅ 응답 구조 유연하게 처리
        const newAccessToken =
          res.data?.accessToken || res.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("응답에 accessToken이 존재하지 않습니다.");
        }

        // ✅ 새 AccessToken 저장
        sessionStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        // ✅ 기존 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.info("✅ AccessToken 갱신 성공 → 원 요청 재시도");
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("🚫 토큰 재발급 실패 → 로그인 필요:", refreshErr);
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    // 기타 오류는 그대로 반환
    return Promise.reject(error);
  },
);

export default api;
