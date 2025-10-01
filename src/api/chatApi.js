// src/api/chatApi.js
import api from "./index"; // axios 인스턴스 (Authorization 헤더 포함하도록 설정)

export const sendPrompt = async (prompt) => {
  const res = await api.post("/chat/send-prompt", { prompt });
  return res.data; // EstimateResult
};

export const getChatRooms = async () => {
  const res = await api.get("/chat/rooms");
  return res.data;
};

export const getChatRoom = async (roomId) => {
  const res = await api.get(`/chat/rooms/${roomId}`);
  return res.data;
};

export const updateChatRoom = async (roomId, title) => {
  const res = await api.patch(`/chat/rooms/${roomId}`, { title });
  return res.data;
};

export const deleteChatRoom = async (roomId) => {
  await api.delete(`/chat/rooms/${roomId}`);
};
