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
      <div className="cp-question-header">
        <IconButton onClick={handleBack} className="cp-back-btn">
          <ArrowBackIcon />
        </IconButton>
        <h3 className="cp-question-title">{userQuestion}</h3>
      </div>
      <div className="cp-chat-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.sender === "user" ? "cp-message-user" : "cp-message-ai"
            }
          >
            <strong>{msg.sender === "user" ? "나" : "스펙메이트"}</strong>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
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
