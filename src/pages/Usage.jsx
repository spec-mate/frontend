import React, { useEffect, useState, useRef } from "react";
import "./styles/Usage.css";
import { useHeaderStore } from "../store/headerStore";
import Header from "../components/Header";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getWebSocketUrl } from "../api"; // ✅ 헬퍼 함수 사용
import api from "../api"; // ✅ 토큰 갱신 요청용

export default function Usage() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);
  const [showResult, setShowResult] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  // ✅ AccessToken이 만료되었으면 refreshToken으로 갱신
  const ensureFreshToken = async () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        console.warn("🔄 AccessToken 만료 → Refresh 시도");
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) return;

        const res = await api.post("/auth/refresh", null, {
          params: { refreshToken },
          headers: { "Content-Type": "application/json" },
        });

        sessionStorage.setItem("accessToken", res.data.accessToken);
      }
    } catch (err) {
      console.error("토큰 검증/갱신 실패:", err);
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    if (showResult) {
      const connectWs = async () => {
        await ensureFreshToken(); // ✅ WebSocket 열기 전에 토큰 갱신

        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          console.error("❌ AccessToken 없음. 로그인 필요");
          return;
        }

        const wsUrl = getWebSocketUrl("/ws/chat"); // ✅ 헬퍼 사용
        console.log("🔗 WebSocket 연결 시도:", wsUrl);

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => console.log("✅ WebSocket 연결 성공");

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "thinking") {
              setMessages((prev) => [
                ...prev,
                { sender: "ai", text: "🤔 스펙메이트가 생각 중..." },
              ]);
            } else {
              if (Array.isArray(data.status)) {
                setStatusList(data.status);
              }
              setMessages((prev) => [
                ...prev,
                { sender: "ai", text: JSON.stringify(data) },
              ]);
            }
          } catch {
            setMessages((prev) => [
              ...prev,
              { sender: "ai", text: event.data },
            ]);
          }
        };

        wsRef.current.onclose = () => console.log("❌ WebSocket 연결 종료");
      };

      connectWs();

      return () => wsRef.current?.close();
    }
  }, [showResult]);

  const handleSend = () => {
    const inputValue = document.querySelector(".chat-input")?.value;
    const question = inputValue || "화이트 계열의 PC를 맞추고 싶어요!";
    setUserQuestion(question);
    setShowResult(true);
    setMessages((prev) => [...prev, { sender: "user", text: question }]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(question);
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setUserQuestion("");
    setMessages([]);
    setStatusList([]);
  };

  return (
    <div className="usage-page">
      {!showResult ? (
        <Header />
      ) : (
        <div className="result-header">
          <IconButton onClick={handleBack} className="back-btn">
            <ArrowBackIcon />
          </IconButton>
          <h3>{userQuestion}</h3>
        </div>
      )}

      <main className="usage-main">
        {!showResult ? (
          <>
            {/* 초기 화면 */}
            <div className="hero-section">
              <h2 className="usage-title">
                당신만을 위한 맞춤형 PC 견적 AI,{" "}
                <span className="highlight">스펙메이트</span>
              </h2>
              <div className="usage-character">
                <img src="/character.svg" alt="스펙메이트 캐릭터" />
              </div>
            </div>

            <div className="question-list">
              <div className="question-row">
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion("화이트 계열의 PC를 맞추고 싶어요!");
                    setShowResult(true);
                  }}
                >
                  화이트 계열의 PC를 맞추고 싶어요!
                </button>
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion(
                      "인공지능 모델을 학습시키고 사용할 수 있는 PC 견적을 작성해주세요."
                    );
                    setShowResult(true);
                  }}
                >
                  인공지능 모델을 학습시키고 사용할 수 있는 PC 견적을
                  작성해주세요.
                </button>
              </div>
              <div className="question-row">
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion(
                      "예산 300만원 안에서 게임용 PC 5대 추천해주세요."
                    );
                    setShowResult(true);
                  }}
                >
                  예산 300만원 안에서 게임용 PC 5대 추천해주세요.
                </button>
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion(
                      "RTX 5060Ti가 들어간 120만원 PC 견적을 맞춰주세요."
                    );
                    setShowResult(true);
                  }}
                >
                  RTX 5060Ti가 들어간 120만원 PC 견적을 맞춰주세요.
                </button>
              </div>
            </div>

            <div className="input-section">
              <input
                type="text"
                placeholder="어떻게 견적을 짜드릴까요? 스펙메이트에게 물어보세요!"
                className="chat-input"
              />
              <IconButton className="send-btn" onClick={handleSend}>
                <SendIcon style={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </div>
          </>
        ) : (
          <>
            {/* 결과 화면 */}
            <div className="chat-container">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={msg.sender === "user" ? "chat-user" : "chat-ai"}
                >
                  <strong>{msg.sender === "user" ? "나" : "스펙메이트"}</strong>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="input-section">
              <input
                type="text"
                placeholder="원하는 견적을 입력해보세요!"
                className="chat-input"
              />
              <IconButton className="send-btn" onClick={handleSend}>
                <SendIcon style={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
