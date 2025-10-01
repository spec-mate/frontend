import axios from "axios";

const api = axios.create({
  baseURL: "/api", // vite.config.js proxy 사용
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ WebSocket URL 생성 헬퍼
export const getWebSocketUrl = (path) => {
  const base =
    import.meta.env.VITE_WS_BASE_URL ||
    "wss://specmate-backend-alb-736149231.ap-northeast-2.elb.amazonaws.com";
  return `${base}${path}`;
};

export default api;
