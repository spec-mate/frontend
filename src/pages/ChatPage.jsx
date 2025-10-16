import React, { useEffect, useRef } from "react";
import "../pages/styles/ChatPage.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EstimateTable from "../components/EstimateTable.jsx"; // 새로 만들 컴포넌트 임포트

export default function ChatPage({
  messages,
  handleBack,
  handleSend,
  isLoading,
}) {
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const onSendClick = () => {
    if (chatInputRef.current) {
      handleSend(chatInputRef.current.value);
      chatInputRef.current.value = "";
    }
  };

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
                {/* AI 응답이 견적 데이터(data)인지 일반 텍스트(text)인지에 따라 렌더링 분기 */}
                {msg.data ? <EstimateTable estimate={msg.data} /> : msg.text}
              </div>
            </div>
          ) : (
            <div key={idx} className="cp-message-user">
              <div className="cp-user-bubble">{msg.text}</div>
            </div>
          ),
        )}
        {/* 로딩 중일 때 로딩 인디케이터 표시 */}
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
            <div className="cp-ai-bubble loading">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        )}
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
