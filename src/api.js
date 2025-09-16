import axios from "axios";

const api = axios.create({
  baseURL: "https://specmate-backend-dev.onrender.com/api", // Vite 프록시 쓰면 "/api"만 써도 됨
  headers: { "Content-Type": "application/json" },
});

export default api;
