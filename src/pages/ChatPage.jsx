// src/pages/ChatPage.jsx
import React, { useState, useEffect } from "react";
import { sendPrompt, getChatRooms } from "../api/chatApi";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [rooms, setRooms] = useState([]);

  // 채팅방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getChatRooms();
        setRooms(data);
      } catch (err) {
        console.error("채팅방 목록 불러오기 실패", err);
      }
    };
    fetchRooms();
  }, []);

  // 프롬프트 전송
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      const res = await sendPrompt(message);
      setResponse(res);
    } catch (err) {
      console.error("프롬프트 전송 실패", err);
    }
  };

  return (
    <div className="chat-page">
      <h2>채팅</h2>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={handleSend}>보내기</button>
      </div>

      {response && (
        <div className="chat-response">
          <h4>GPT 응답</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      <div className="chat-rooms">
        <h4>내 채팅방</h4>
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>{room.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
