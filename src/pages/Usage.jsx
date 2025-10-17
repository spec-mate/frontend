import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/styles/Usage.css";
import { useHeaderStore } from "../store/headerStore";
import Header from "../components/Header";
import ChatPage from "./ChatPage";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import api from "../api";
import Toast from "../components/Toast";

export default function Usage() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);
  const navigate = useNavigate();

  const [inChat, setInChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 토스트 메시지 상태 관리
  const [toastInfo, setToastInfo] = useState({
    show: false,
    message: "",
    type: "warning",
  });

  const initialInputRef = useRef(null);

  // 토스트가 닫힐 때 로그인 페이지로 이동하는 함수
  const handleToastClose = () => {
    setToastInfo((prev) => ({ ...prev, show: false }));
    navigate("/login"); // '/login' 경로로 이동
  };

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  const handleSend = async (promptText) => {
    const question = promptText.trim();
    if (!question || isLoading) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: question }]);

    try {
      // 로그인 상태를 미리 확인하지 않고, 바로 API 요청을 시도합니다.
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

      // API 요청 실패 시, 서버 응답이 인증 에러(401, 403)인지 확인합니다.
      // api.js의 인터셉터가 토큰 갱신에 실패하면 이 코드가 실행됩니다.
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        setToastInfo({
          show: true,
          message: "로그인 후 이용해주세요.",
          type: "warning",
        });
      } else {
        // 그 외 다른 네트워크 에러나 서버 에러 처리
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          },
        ]);
      }
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
      {/* 토스트 메시지를 조건부로 렌더링 */}
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
                  disabled={isLoading}
                >
                  화이트 계열의 PC를 맞추고 싶어요!
                </button>
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                  disabled={isLoading}
                >
                  인공지능 모델을 원활하게 학습시키고 사용할 수 있는 PC 견적을
                  작성해주세요.
                </button>
              </div>
              <div className="question-group-row">
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                  disabled={isLoading}
                >
                  예산 상관없이 게임이 잘 돌아가는 게이밍 PC를 5대 정도 맞춰서
                  추천해주세요.
                </button>
                <button
                  className="question-bubble-btn"
                  onClick={handleBubbleClick}
                  disabled={isLoading}
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
                disabled={isLoading}
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
