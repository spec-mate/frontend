import React from "react";
import "../pages/styles/ChatPage.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

export default function ChatPage({
  userQuestion,
  messages,
  handleBack,
  handleSend,
}) {
  return (
    <div className="cp-chat-page">
      {/* 상단 질문 헤더 */}
      <div className="cp-question-header">
        <IconButton onClick={handleBack} className="cp-back-btn">
          <ArrowBackIcon />
        </IconButton>
        <h3 className="cp-question-title">{userQuestion}</h3>
      </div>

      {/* 채팅 영역 */}
      <div className="cp-chat-container">
        {messages.map((msg, idx) =>
          msg.sender === "ai" ? (
            <div key={idx} className="cp-message-ai">
              {/* ✅ 스펙메이트 프로필 (동그란 이미지 + 파란 이름) */}
              <div className="cp-ai-profile">
                <img
                  src="/small-character.svg"
                  alt="스펙메이트"
                  className="cp-ai-avatar"
                />
                <span className="cp-ai-name">스펙메이트</span>
              </div>

              <div className="cp-ai-bubble">{msg.text}</div>
            </div>
          ) : (
            <div key={idx} className="cp-message-user">
              <div className="cp-user-bubble">{msg.text}</div>
            </div>
          ),
        )}
      </div>

      {/* 입력창 */}
      <div className="cp-input-section">
        <input
          type="text"
          placeholder="어떻게 PC 견적을 짜드릴까요? 스펙메이트에게 물어보세요!"
          className="cp-chat-input"
        />
        <IconButton className="cp-send-btn" onClick={handleSend}>
          <SendIcon style={{ transform: "rotate(-45deg)" }} />
        </IconButton>
      </div>
    </div>
  );
}
