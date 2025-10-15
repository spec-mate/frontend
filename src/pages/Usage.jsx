import React, { useEffect, useState } from "react";
import "../pages/styles/Usage.css";
import { useHeaderStore } from "../store/headerStore";
import Header from "../components/Header";
import ChatPage from "./ChatPage";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import api from "../api";

export default function Usage() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);
  const [inChat, setInChat] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  const handleSend = async () => {
    const inputValue = document.querySelector(".main-chat-input")?.value.trim();
    if (!inputValue) return;
    const question = inputValue;
    setUserQuestion(question);
    setInChat(true);
    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    try {
      const res = await api.post(
        "/chat/send-prompt",
        { prompt: question },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: JSON.stringify(res.data) },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "응답을 불러오지 못했습니다." },
      ]);
    }
  };

  const handleBack = () => {
    setInChat(false);
    setUserQuestion("");
    setMessages([]);
  };

  return (
    <div className="usage-page-container">
      <Header />
      <main className="usage-main-content">
        {!inChat ? (
          <>
            <div className="section-hero">
              <h2 className="usage-title-text">
                당신만을 위한 맞춤형 PC 견적 AI,{" "}
                <span className="highlight-main">스펙메이트</span>
              </h2>
              <div className="character-image-box">
                <img src="/character.svg" alt="스펙메이트 캐릭터" />
              </div>
            </div>
            <div className="question-group-list">
              <div className="question-group-row">
                <button className="question-bubble-btn">
                  화이트 계열의 PC를 맞추고 싶어요!
                </button>
                <button className="question-bubble-btn">
                  인공지능 모델을 원활하게 학습시키고 사용할 수 있는 PC 견적을
                  작성해주세요.
                </button>
              </div>
              <div className="question-group-row">
                <button className="question-bubble-btn">
                  예산 상관없이 게임이 잘 돌아가는 게이밍 PC를 5대 정도 맞춰서
                  추천해주세요.
                </button>
                <button className="question-bubble-btn">
                  RTX 5060TI가 들어간 120만원 정도의 PC를 맞춰주세요.
                </button>
              </div>
            </div>
            <div className="main-input-section">
              <input
                type="text"
                placeholder="어떻게 견적을 짜드릴까요? 스펙메이트에게 물어보세요!"
                className="main-chat-input"
              />
              <IconButton className="main-send-btn" onClick={handleSend}>
                <SendIcon style={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </div>
          </>
        ) : (
          <ChatPage
            userQuestion={userQuestion}
            messages={messages}
            handleBack={handleBack}
            handleSend={handleSend}
          />
        )}
      </main>
    </div>
  );
}
