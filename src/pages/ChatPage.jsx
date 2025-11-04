import React, { useEffect, useRef, useState } from "react";
import "./styles/ChatPage.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EstimateTable from "../components/EstimateTable.jsx";
import api from "../api";

export default function ChatPage({
  messages,
  setMessages,
  handleBack,
  isLoading,
  setIsLoading,
}) {
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [accessToken] = useState(
    // ✅ 세션 내에서 고정된 토큰
    localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken"),
  );

  // ✅ 페이지 진입 시 자동 채팅방 생성
  useEffect(() => {
    const createChatRoom = async () => {
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        handleBack();
        return;
      }

      try {
        const res = await api.post(
          "/chat/rooms",
          { title: "AI 견적 요청" },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        console.log("✅ 새 채팅방 생성 완료:", res.data);
        setRoomId(res.data.id);
      } catch (err) {
        console.error("❌ 채팅방 생성 실패:", err);
        alert("채팅방 생성 중 오류가 발생했습니다.");
      }
    };
    createChatRoom();
  }, [accessToken]);

  // ✅ 메시지 스크롤 유지
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ✅ 메시지 전송
  const handleSend = async (userInput) => {
    if (!userInput.trim()) return;

    if (!roomId) {
      alert("채팅방 ID가 아직 생성되지 않았습니다. 잠시만 기다려주세요.");
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);

    try {
      const res = await api.post(
        `/chat/rooms/${roomId}/messages`,
        {
          text: userInput,
          notes: "사용자 요청 기반 AI 견적",
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      console.log("✅ AI 응답:", res.data);

      const aiData = res.data?.data || res.data;
      const isPromptOnly = typeof aiData?.prompt === "string";

      if (!aiData || Object.keys(aiData).length === 0) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "AI 응답 데이터를 불러오지 못했습니다." },
        ]);
      } else if (isPromptOnly) {
        setMessages((prev) => [...prev, { sender: "ai", text: aiData.prompt }]);
      } else {
        setMessages((prev) => [...prev, { sender: "ai", data: aiData }]);
      }
    } catch (err) {
      console.error("❌ 채팅 메시지 전송 실패:", err);

      // ✅ 명시적 만료 에러만 api.js에서 refresh하도록 처리됨
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            err.response?.status === 403
              ? "권한이 만료되었습니다. 잠시 후 다시 시도해주세요."
              : "서버 응답 오류가 발생했습니다.",
        },
      ]);
    } finally {
      setIsLoading(false);
      if (chatInputRef.current) chatInputRef.current.value = "";
    }
  };

  const onSendClick = () => {
    if (chatInputRef.current) {
      const value = chatInputRef.current.value.trim();
      if (value) handleSend(value);
    }
  };

  const handleBackWithReset = () => {
    setIsLoading(false);
    setMessages([]);
    ["chatMessages", "chatHistory", "chatRoomMessages", "messages"].forEach(
      (k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      },
    );
    handleBack();
  };

  // ✅ 설명형 여부 판별
  const lastUserMessage =
    messages.filter((msg) => msg.sender === "user").pop()?.text || "요청";

  const isExplanationMessage = (text) => {
    if (!text) return false;
    const keywords = ["이유", "왜", "추천", "설명", "근거", "차이"];
    return keywords.some((kw) => text.includes(kw));
  };

  // ✅ 중복 부품 제거 + 정렬
  const deduplicateComponents = (components = []) => {
    const unique = [];
    const seen = new Set();
    for (const c of components) {
      const key = c.type?.toLowerCase() || "unknown";
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ ...c, type: key });
      }
    }
    return unique;
  };

  const normalizeComponents = (components = []) => {
    const ORDER = [
      "mainboard",
      "cpu",
      "vga",
      "ram",
      "ssd",
      "hdd",
      "cooler",
      "power",
      "case",
    ];
    const map = {};
    for (const c of components) {
      const key = c.type?.toLowerCase() || "unknown";
      map[key] = c;
    }

    return ORDER.map(
      (type) =>
        map[type] || {
          type,
          name: "미선택",
          description: "정보 없음",
          detail: { price: "0", image: "" },
        },
    );
  };

  // ✅ 견적 저장
  const handleSaveEstimate = async (estimateData) => {
    if (!estimateData?.components) {
      alert("저장할 견적 데이터가 없습니다.");
      return;
    }

    const cleaned = normalizeComponents(
      deduplicateComponents(estimateData.components),
    );
    const safeTitle = estimateData.title?.trim() || "AI 추천 견적";

    const payload = {
      id: `local-ai-${Date.now()}`,
      title: safeTitle,
      description: estimateData.description || "",
      notes: estimateData.notes || "",
      total: String(estimateData.total || "0"),
      isAi: true,
      components: cleaned.map((c) => ({
        type: c.type,
        name: c.name,
        description: c.description,
        price: c.detail?.price || "0",
        image: c.detail?.image || "",
      })),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "aiEstimateList",
      JSON.stringify([
        payload,
        ...(JSON.parse(localStorage.getItem("aiEstimateList")) || []),
      ]),
    );

    if (accessToken) {
      try {
        const dbPayload = {
          build_name: safeTitle,
          build_description: payload.description,
          total: String(payload.total),
          notes: payload.notes,
          components: cleaned.map((c) => ({
            type: c.type,
            name: c.name,
            description: c.description,
            detail: {
              price: c.detail?.price || "0",
              image: c.detail?.image || "",
            },
          })),
        };

        const res = await api.post("/aiestimates", dbPayload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log("✅ 견적 DB 저장 완료:", res.data);
      } catch (err) {
        console.error("❌ DB 저장 실패:", err);
      }
    } else {
      console.warn("⚠️ 로그인 정보 없음 — localStorage에만 저장됨.");
    }

    alert("AI 견적이 보관함에 추가되었습니다!");
  };

  return (
    <div className="cp-chat-page">
      <div className="cp-question-header">
        <IconButton onClick={handleBackWithReset} className="cp-back-btn">
          <ArrowBackIcon />
        </IconButton>
        <h3 className="cp-question-title">
          {messages.length > 0 ? messages[0].text : "AI 견적"}
        </h3>
      </div>

      <div className="cp-chat-container" ref={chatContainerRef}>
        {messages.map((msg, idx) => {
          if (msg.sender === "ai") {
            const aiData = msg.data?.data ? msg.data.data : msg.data;
            const hasEstimate =
              aiData?.components && aiData.components.length > 0;
            const isExplanation = isExplanationMessage(aiData?.text);

            return (
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
                  {hasEstimate && !isExplanation ? (
                    <>
                      <EstimateTable
                        estimate={{
                          ...aiData,
                          components: normalizeComponents(
                            deduplicateComponents(aiData.components),
                          ),
                        }}
                      />
                      <div className="cp-bubble-actions">
                        <button
                          onClick={() =>
                            handleSaveEstimate({
                              ...aiData,
                              components: normalizeComponents(
                                deduplicateComponents(aiData.components),
                              ),
                            })
                          }
                          className="cp-save-estimate-btn"
                        >
                          보관함으로 이동
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="cp-ai-text">
                      {aiData?.prompt ||
                        aiData?.text ||
                        msg.text ||
                        "AI 응답 데이터를 불러오지 못했습니다."}
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
              <img
                src="/small-character.svg"
                alt="스펙메이트"
                className="cp-ai-avatar"
              />
              <span className="cp-ai-name">스펙메이트</span>
            </div>
            <div className="cp-ai-bubble">
              <div className="loading-indicator">
                <div className="svg-spinner">
                  <svg viewBox="25 25 50 50">
                    <circle r="20" cy="50" cx="50" />
                  </svg>
                </div>
                <span>
                  {isExplanationMessage(lastUserMessage)
                    ? "사용자의 의도 파악 중..."
                    : `"${lastUserMessage}" 검색어로 찾는 중...`}
                </span>
              </div>
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
