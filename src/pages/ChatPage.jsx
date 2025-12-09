// src/pages/ChatPage.jsx
import React, { useEffect, useRef, useState } from "react";
import "./styles/ChatPage.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import EstimateTable from "../components/EstimateTable";
import api, { getAccessToken } from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [copiedIndex, setCopiedIndex] = useState(null);

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
    setMessages((prev) => [...prev, { sender: "user", text: userInput, timestamp: new Date() }]);

    try {
      const res = await api.post(`/chat/room/${roomId}/message`, {
        content: userInput,
      });

      const aiData = res.data;
      setMessages((prev) => [...prev, { sender: "ai", data: aiData, timestamp: new Date() }]);
    } catch (err) {
      console.error("메시지 전송 실패:", err);

      let message = "오류가 발생했습니다.";
      if ([401, 403].includes(err.response?.status)) {
        message = "인증이 만료되었습니다. 다시 로그인해주세요.";
      }

      setMessages((prev) => [...prev, { sender: "ai", text: message, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      if (chatInputRef.current) chatInputRef.current.value = "";
    }
  };

  const onSendClick = () => {
    const text = chatInputRef.current?.value?.trim();
    if (text) handleSend(text);
  };

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 복사 기능
  const handleCopy = (idx, msg) => {
    let textToCopy = "";

    if (msg.data) {
      const ai = msg.data;

      // reply 추가
      if (ai.reply) {
        textToCopy += ai.reply + "\n\n";
      }

      // intro 추가
      if (ai.intro) {
        textToCopy += ai.intro + "\n\n";
      }

      // 견적 내용 추가
      if (ai.main) {
        textToCopy += formatEstimateAsText(ai.main, ai.total) + "\n\n";
      }

      // another_input_text 추가
      if (ai.another_input_text) {
        textToCopy += ai.another_input_text;
      }
    } else if (msg.text) {
      textToCopy = msg.text;
    }

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // 견적을 텍스트로 변환 (복사용)
  const formatEstimateAsText = (mainObj = {}, total = "") => {
    if (!mainObj || typeof mainObj !== "object") return "";

    let text = "";

    Object.entries(mainObj).forEach(([key, component]) => {
      if (!component || component === null) return;

      const categoryName = getCategoryDisplayName(component.category);
      const name = component.name || "";
      const description = component.description || "";
      const price = component.price ? `${Number(component.price).toLocaleString()}원` : "";

      text += `[${categoryName}]\n${name}\n`;
      if (description) {
        text += `${description}\n`;
      }
      if (price) {
        text += `가격: ${price}\n`;
      }
      text += "\n";
    });

    if (total) {
      text += `총 예상 가격: ${total}`;
    }

    return text;
  };

  const convertMainToComponents = (mainObj = {}) => {
    if (!mainObj || typeof mainObj !== "object") return [];

    return Object.values(mainObj)
      .filter((item) => item && typeof item === "object") // null 제거
      .map((item) => ({
        type: item.category || "",
        name: item.name || "",
        description: item.description || "",
        detail: {
          price: String(item.price || "0"),
          image: item.image || "/no-image.svg",
        },
      }));
  };

  // 카테고리 이름 한글 변환
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      cpu: "CPU",
      gpu: "그래픽카드",
      ram: "메모리",
      ssd: "SSD",
      hdd: "HDD",
      mainboard: "메인보드",
      power: "파워",
      case: "케이스",
      cpucooler: "CPU쿨러",
      casecooler: "케이스쿨러",
    };
    return categoryMap[category] || category;
  };

  // 견적을 JSX 형식으로 렌더링
  const renderEstimateContent = (mainObj = {}, total = "") => {
    if (!mainObj || typeof mainObj !== "object") return null;

    const components = Object.entries(mainObj)
      .filter(([_, component]) => component && component !== null)
      .map(([key, component]) => {
        const categoryName = getCategoryDisplayName(component.category);
        const name = component.name || "";
        const description = component.description || "";
        const price = component.price ? `${Number(component.price).toLocaleString()}원` : "";

        return (
          <div key={key} className="cp-estimate-item">
            <div className="cp-estimate-category">[{categoryName}]</div>
            <div className="cp-estimate-name">{name}</div>
            {description && (
              <div className="cp-estimate-description">{description}</div>
            )}
            {price && (
              <div className="cp-estimate-price">가격: {price}</div>
            )}
          </div>
        );
      });

    return (
      <div className="cp-estimate-content">
        {components}
        {total && (
          <div className="cp-estimate-total">
            총 예상 가격: <strong>{total}</strong>
          </div>
        )}
      </div>
    );
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
            const hasEstimateContent = ai.intro || ai.main || ai.another_input_text;
            const reply = ai.reply;

            return (
              <div key={idx} className="cp-message-ai">
                <div className="cp-ai-profile">
                  <img src="/small-character.svg" className="cp-ai-avatar" />
                  <span className="cp-ai-name">스펙메이트</span>
                </div>
                <div className="cp-ai-content">
                  <div className="cp-ai-bubble-wrapper">
                    <div className="cp-ai-bubble">
                      {reply && (
                        <div className="cp-ai-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {reply}
                          </ReactMarkdown>
                        </div>
                      )}
                      {hasEstimateContent && (
                        <>
                          {ai.intro && (
                            <div className="cp-ai-intro">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {ai.intro}
                              </ReactMarkdown>
                            </div>
                          )}
                          {ai.main && renderEstimateContent(ai.main, ai.total)}
                          {ai.another_input_text && (
                            <div className="cp-ai-note">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {ai.another_input_text}
                              </ReactMarkdown>
                            </div>
                          )}
                        </>
                      )}
                      {!reply && !hasEstimateContent && (
                        <div className="cp-ai-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {ai.prompt || msg.text || "응답을 생성할 수 없습니다."}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <button
                      className="cp-copy-btn"
                      onClick={() => handleCopy(idx, msg)}
                      title="복사"
                    >
                      {copiedIndex === idx ? (
                        <CheckIcon style={{ fontSize: 16 }} />
                      ) : (
                        <ContentCopyIcon style={{ fontSize: 16 }} />
                      )}
                    </button>
                  </div>
                  {msg.timestamp && (
                    <span className="cp-message-time">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="cp-message-user">
              <span className="cp-user-name">나</span>
              <div className="cp-user-bubble">{msg.text}</div>
              {msg.timestamp && (
                <span className="cp-message-time">{formatTime(msg.timestamp)}</span>
              )}
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
                <span>요구사항 파악 중...</span>
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
