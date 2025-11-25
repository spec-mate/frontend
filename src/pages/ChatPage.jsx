// src/pages/ChatPage.jsx
import React, { useEffect, useRef, useState } from "react";
import "./styles/ChatPage.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EstimateTable from "../components/EstimateTable";
import api, { getAccessToken } from "../api";

export default function ChatPage({
  messages,
  setMessages,
  handleBack,
  isLoading,
  setIsLoading,
}) {
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const scrollRef = useRef(null); // 👈 자동 스크롤 anchor
  const [roomId, setRoomId] = useState(null);
  const hasCreatedRoomRef = useRef(false);

  // ---------- 최초 채팅방 생성 ----------
  useEffect(() => {
    if (hasCreatedRoomRef.current) return;
    hasCreatedRoomRef.current = true;

    const createChatRoom = async () => {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        handleBack();
        return;
      }

      try {
        const res = await api.post("/chat/room", {});
        const newRoomId = res.data.id;
        setRoomId(newRoomId);
        localStorage.setItem("chatRoomId", newRoomId);
        console.log("채팅방 ID 생성:", newRoomId);
      } catch (err) {
        console.error("채팅방 생성 실패:", err);
        hasCreatedRoomRef.current = false;
        alert("채팅방을 생성할 수 없습니다.");
      }
    };

    createChatRoom();
  }, []);

  // ---------- 자동 스크롤 ----------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // ---------- 메시지 전송 ----------
  const handleSend = async (userInput) => {
    if (!userInput.trim()) return;
    if (!roomId) {
      alert("채팅방 생성 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);

    try {
      const res = await api.post(`/chat/room/${roomId}/message`, {
        content: userInput,
      });

      const aiData = res.data;
      setMessages((prev) => [...prev, { sender: "ai", data: aiData }]);
    } catch (err) {
      console.error("메시지 전송 실패:", err);

      let message = "오류가 발생했습니다.";
      if ([401, 403].includes(err.response?.status)) {
        message = "인증이 만료되었습니다. 다시 로그인해주세요.";
      }

      setMessages((prev) => [...prev, { sender: "ai", text: message }]);
    } finally {
      setIsLoading(false);
      if (chatInputRef.current) chatInputRef.current.value = "";
    }
  };

  const onSendClick = () => {
    const text = chatInputRef.current?.value?.trim();
    if (text) handleSend(text);
  };

  const convertMainToComponents = (mainObj = {}) => {
    return Object.values(mainObj).map((item) => ({
      type: item.category,
      name: item.name,
      description: item.description,
      detail: { price: String(item.price || "0"), image: item.image || "" },
    }));
  };

  return (
    <div className="cp-chat-page">
      <div className="cp-question-header">
        <IconButton onClick={handleBack} className="cp-back-btn">
          <ArrowBackIcon />
        </IconButton>
        <h3 className="cp-question-title">AI 견적 상담</h3>
      </div>

      <div className="cp-chat-container" ref={chatContainerRef}>
        {messages.map((msg, idx) => {
          if (msg.sender === "ai") {
            const ai = msg.data || {};

            const isEstimate = ai.intent === "build" || ai.intent === "modify";
            const reply = ai.reply;

            return (
              <div key={idx} className="cp-message-ai">
                <div className="cp-ai-profile">
                  <img src="/small-character.svg" className="cp-ai-avatar" />
                  <span className="cp-ai-name">스펙메이트</span>
                </div>
                <div className="cp-ai-bubble">
                  {reply && <p className="cp-ai-text">{reply}</p>}
                  {isEstimate && (
                    <>
                      {ai.intro && <p className="cp-ai-text">{ai.intro}</p>}
                      {ai.main && (
                        <EstimateTable
                          estimate={{
                            components: convertMainToComponents(ai.main),
                            total: ai.total || "0",
                          }}
                        />
                      )}
                      {ai.another_input_text && (
                        <p className="cp-ai-text">{ai.another_input_text}</p>
                      )}
                    </>
                  )}
                  {!reply && !isEstimate && (
                    <p className="cp-ai-text">
                      {ai.prompt || msg.text || "응답을 생성할 수 없습니다."}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="cp-message-user">
              <div className="cp-user-bubble">{msg.text}</div>
            </div>
          );
        })}

        {isLoading && (
          <div className="cp-message-ai">
            <div className="cp-ai-profile">
              <img src="/small-character.svg" className="cp-ai-avatar" />
              <span className="cp-ai-name">스펙메이트</span>
            </div>
            <div className="cp-ai-bubble">
              <div className="loading-indicator">
                <div className="svg-spinner">
                  <svg viewBox="25 25 50 50">
                    <circle r="20" cy="50" cx="50" />
                  </svg>
                </div>
                <span>처리 중...</span>
              </div>
            </div>
          </div>
        )}

        {/* ---------- 자동 스크롤 anchor ---------- */}
        <div ref={scrollRef}></div>
      </div>

      <div className="cp-input-section">
        <input
          ref={chatInputRef}
          type="text"
          placeholder="질문을 입력하세요..."
          className="cp-chat-input"
          onKeyUp={(e) => e.key === "Enter" && onSendClick()}
          disabled={isLoading}
        />
        <IconButton onClick={onSendClick} disabled={isLoading}>
          <SendIcon style={{ transform: "rotate(-45deg)" }} />
        </IconButton>
      </div>
    </div>
  );
}
