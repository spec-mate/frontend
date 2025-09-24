import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ HttpOnly 쿠키 전송 허용
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken"); // 👉 세션스토리지에서 읽음
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
