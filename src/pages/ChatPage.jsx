import React, { useEffect, useRef } from "react";
import "./styles/ChatPage.css"; // CSS 파일 임포트
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EstimateTable from "../components/EstimateTable.jsx";

export default function ChatPage({
  messages,
  handleBack,
  handleSend,
  isLoading,
}) {
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const onSendClick = () => {
    if (chatInputRef.current) {
      handleSend(chatInputRef.current.value);
      chatInputRef.current.value = "";
    }
  };

  const lastUserMessage =
    messages.filter((msg) => msg.sender === "user").pop()?.text || "요청";

  return (
    <div className="cp-chat-page">
      <div className="cp-question-header">
        <IconButton onClick={handleBack} className="cp-back-btn">
          <ArrowBackIcon />
        </IconButton>
        <h3 className="cp-question-title">
          {messages.length > 0 ? messages[0].text : "AI 견적"}
        </h3>
      </div>

      <div className="cp-chat-container" ref={chatContainerRef}>
        {messages.map((msg, idx) =>
          msg.sender === "ai" ? (
            <div key={idx} className="cp-message-ai">
              <div className="cp-ai-profile">
                <img
                  src="/small-character.svg"
                  alt="스펙메이트"
                  className="cp-ai-avatar"
                />
                <span className="cp-ai-name">스펙메이트</span>
              </div>
              <div className="cp-ai-bubble">
                {msg.data ? <EstimateTable estimate={msg.data} /> : msg.text}
              </div>
            </div>
          ) : (
            <div key={idx} className="cp-message-user">
              <div className="cp-user-bubble">{msg.text}</div>
            </div>
          ),
        )}

        {/* ▼▼▼ 여기가 수정된 로딩 블록입니다 ▼▼▼ */}
        {isLoading && (
          <div className="cp-message-ai">
            <div className="cp-ai-profile">
              <img
                src="/small-character.svg"
                alt="스펙메이트"
                className="cp-ai-avatar"
              />
              <span className="cp-ai-name">스펙메이트</span>
            </div>
            <div className="cp-ai-bubble">
              <div className="loading-indicator">
                {/* SVG 스피너를 JSX로 직접 작성합니다. */}
                <div className="svg-spinner">
                  <svg viewBox="25 25 50 50">
                    <circle r="20" cy="50" cx="50" />
                  </svg>
                </div>
                <span>{`"${lastUserMessage}" 검색어로 찾는 중...`}</span>
              </div>
            </div>
          </div>
        )}
        {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
      </div>

      <div className="cp-input-section">
        <input
          ref={chatInputRef}
          type="text"
          placeholder="추가 질문을 입력하세요..."
          className="cp-chat-input"
          onKeyUp={(e) => e.key === "Enter" && onSendClick()}
          disabled={isLoading}
        />
        <IconButton
          className="cp-send-btn"
          onClick={onSendClick}
          disabled={isLoading}
        >
          <SendIcon style={{ transform: "rotate(-45deg)" }} />
        </IconButton>
      </div>
    </div>
  );
}
