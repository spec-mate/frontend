import React, { useEffect, useState, useRef } from "react";
import "../pages/styles/Usage.css";
import { useHeaderStore } from "../store/headerStore"; // Header용 store (기존)
import { useAuthStore } from "../store/authStore"; //  ▼▼▼ 로그인 상태용 store (수정) ▼▼▼
import Header from "../components/Header";
import ChatPage from "./ChatPage";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Usage() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  // ▼▼▼ 1. useAuthStore에서 로그인 상태 가져오기 (수정) ▼▼▼
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // ▲▲▲ ▲▲▲ ▲▲▲

  const navigate = useNavigate();

  const [inChat, setInChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [toastInfo, setToastInfo] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleToastClose = () => {
    setToastInfo((prev) => ({ ...prev, show: false }));
    navigate("/login"); // (로그인 페이지 경로)
  };

  const initialInputRef = useRef(null);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  const handleSend = async (promptText) => {
    const question = promptText.trim();
    if (!question) return;

    // ▼▼▼ 2. API 호출 전 로그인 상태 확인 (핵심) ▼▼▼
    if (!isLoggedIn) {
      setToastInfo({
        show: true,
        message: "로그인이 필요합니다. 로그인 페이지로 이동합니다.",
        type: "warning",
      });
      return; // 로그인 안했으면 API 호출(try) 전에 함수 종료
    }
    // ▲▲▲ ▲▲▲ ▲▲▲

    if (isLoading) return; // 로딩 중 중복 전송 방지

    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: question }]);

    try {
      let currentRoomId = roomId;

      if (!currentRoomId) {
        const roomRes = await api.post("/chat/rooms", { title: question });
        currentRoomId = roomRes.data.id;
        setRoomId(currentRoomId);
        setInChat(true);
      }

      const msgRes = await api.post(`/chat/rooms/${currentRoomId}/messages`, {
        prompt: question,
      });

      setMessages((prev) => [...prev, { sender: "ai", data: msgRes.data }]);
    } catch (error) {
      console.error("API 요청 실패:", error);

      // ▼▼▼ 3. catch 블록 (401, 403 모두 처리) ▼▼▼
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        setToastInfo({
          show: true,
          message: "로그인이 필요합니다. 로그인 페이지로 이동합니다.",
          type: "warning",
        });
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          },
        ]);
      }
      // ▲▲▲ ▲▲▲ ▲▲▲
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSend = () => {
    if (initialInputRef.current) {
      handleSend(initialInputRef.current.value);
      initialInputRef.current.value = "";
    }
  };

  const handleBubbleClick = (e) => {
    handleSend(e.target.innerText);
  };

  const handleBack = () => {
    setInChat(false);
    setMessages([]);
    setRoomId(null);
  };

  return (
    <div className="usage-page-container">
      {toastInfo.show && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={handleToastClose}
        />
      )}

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
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                >
                  화이트 계열의 PC를 맞추고 싶어요!
                </button>
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                >
                  인공지능 모델을 원활하게 학습시키고 사용할 수 있는 PC 견적을
                  작성해주세요.
                </button>
              </div>
              <div className="question-group-row">
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                >
                  예산 상관없이 게임이 잘 돌아가는 게이밍 PC를 5대 정도 맞춰서
                  추천해주세요.
                </button>
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                >
                  RTX 4060TI가 들어간 120만원 정도의 PC를 맞춰주세요.
                </button>
              </div>
            </div>
            <div className="main-input-section">
              <input
                ref={initialInputRef}
                type="text"
                placeholder="어떻게 견적을 짜드릴까요? 스펙메이트에게 물어보세요!"
                className="main-chat-input"
                onKeyUp={(e) => e.key === "Enter" && handleInitialSend()}
              />
              <IconButton
                className="main-send-btn"
                onClick={handleInitialSend}
                disabled={isLoading}
              >
                <SendIcon style={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </div>
          </>
        ) : (
          <ChatPage
            messages={messages}
            handleBack={handleBack}
            handleSend={handleSend}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}
