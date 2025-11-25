// src/pages/ChatPage.jsx
import React, { useEffect, useRef, useState } from "react";
import "./styles/ChatPage.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EstimateTable from "../components/EstimateTable.jsx";
import api, { getAccessToken } from "../api";

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
  const hasCreatedRoomRef = useRef(false); // ✅ 중복 생성 방지용 플래그

  const convertMainToComponents = (mainObj = {}) => {
    return Object.values(mainObj).map((item) => ({
      type: item.category,
      name: item.name,
      description: item.description,
      detail: {
        price: String(item.price || "0"),
        image: item.image || "",
      },
    }));
  };

  // ✅ 페이지 진입 시 자동 채팅방 생성 (StrictMode 대응)
  useEffect(() => {
    if (hasCreatedRoomRef.current) return; // 이미 생성된 경우 중복 방지
    hasCreatedRoomRef.current = true;

    const createChatRoom = async () => {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        handleBack();
        return;
      }

      try {
        const res = await api.post(
          "/chat/room",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("✅ 새 채팅방 생성 완료:", res.data);

        const newRoomId = res.data.id;
        setRoomId(newRoomId);
        localStorage.setItem("chatRoomId", newRoomId); // ✅ MyPage에서도 참조 가능
      } catch (err) {
        console.error("❌ 채팅방 생성 실패:", err);
        alert("채팅방 생성 중 오류가 발생했습니다.");
        hasCreatedRoomRef.current = false; // 실패 시 재시도 허용
      }
    };

    createChatRoom();
  }, []); // ✅ 한 번만 실행됨 (중복 생성 방지)

  // ✅ 메시지 스크롤 자동 유지
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

    const token = getAccessToken();
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);

    try {
      const res = await api.post(
        `/chat/room/${roomId}/messages`,
        { prompt: userInput },
        { headers: { Authorization: `Bearer ${token}` } },
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
      const status = err.response?.status;
      let errorMsg = "서버 응답 오류가 발생했습니다.";
      if (status === 403 || status === 401) {
        errorMsg = "인증이 만료되었습니다. 잠시 후 다시 시도해주세요.";
      }
      setMessages((prev) => [...prev, { sender: "ai", text: errorMsg }]);
    } finally {
      setIsLoading(false);
      if (chatInputRef.current) chatInputRef.current.value = "";
    }
  };

  const onSendClick = () => {
    const value = chatInputRef.current?.value?.trim();
    if (value) handleSend(value);
  };

  // ✅ 뒤로가기 + 캐시 초기화
  const handleBackWithReset = () => {
    setIsLoading(false);
    setMessages([]);
    handleBack();
  };

  // ✅ 설명형 여부 판별
  const lastUserMessage =
    messages.filter((msg) => msg.sender === "user").pop()?.text || "요청";
  const isExplanationMessage = (text) => {
    const keywords = ["이유", "왜", "추천", "설명", "근거", "차이"];
    return text && keywords.some((kw) => text.includes(kw));
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
      "gpu",
      "ram",
      "storage",
      "cpucooler",
      "power",
      "case",
      "casefan"
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

  // ✅ 견적 저장 (중복 완전 차단)
  const handleSaveEstimate = async (estimateData) => {
    const token = getAccessToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      handleBack();
      return;
    }

    // ✅ 중복 저장 방지 락
    if (window.__savingEstimateInProgress) {
      console.warn("⚠️ 중복 저장 요청 차단됨");
      return;
    }
    window.__savingEstimateInProgress = true;

    try {
      // ✅ 기존 저장된 AI 견적 목록 조회
      const existingRes = await api.get("/aiestimates/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const existingEstimates = Array.isArray(existingRes.data)
        ? existingRes.data
        : existingRes.data.data || [];

      const rawTitle =
        estimateData.title ||
        estimateData.build_name ||
        estimateData.name ||
        "AI 추천 견적";
      const totalValue = String(estimateData.total || "0");

      // ✅ 1️⃣ 동일 aiEstimateId가 이미 존재하는지 확인
      const alreadySavedById = existingEstimates.some(
        (e) => e.id === estimateData.ai_estimate_id,
      );

      if (alreadySavedById) {
        alert("이미 저장된 AI 견적입니다.");
        return;
      }

      // ✅ 2️⃣ 동일 title + total 조합도 중복 저장 차단
      const alreadySavedByContent = existingEstimates.some(
        (e) =>
          (e.title || "").trim() === rawTitle.trim() &&
          String(e.total || "0") === totalValue,
      );

      if (alreadySavedByContent) {
        alert("이미 동일한 견적이 보관함에 있습니다.");
        return;
      }

      // ✅ 저장 데이터 정리
      const cleaned = normalizeComponents(
        deduplicateComponents(estimateData.components),
      );

      const dbPayload = {
        aiEstimateId: estimateData.ai_estimate_id || null,
        title: rawTitle.trim(),
        description:
          estimateData.description || estimateData.build_description || "",
        total: totalValue,
        components: cleaned.map((c) => ({
          type: c.type,
          name: c.name,
          description: c.description,
          detail: {
            price: String(c.detail?.price || "0"),
            image: c.detail?.image || "",
          },
        })),
      };

      console.log("📦 견적 저장 요청:", dbPayload);

      const res = await api.post("/aiestimates", dbPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ 견적 저장 완료:", res.data);
      alert("AI 견적이 보관함에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 견적 저장 실패:", err);
      alert("견적 저장 중 오류가 발생했습니다.");
    } finally {
      setTimeout(() => {
        window.__savingEstimateInProgress = false;
      }, 1500);
    }
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

            const isEstimateIntent =
              aiData.intent === "build" || aiData.intent === "modify";
            const isReply =
              typeof aiData.reply === "string" &&
              aiData.reply.trim().length > 0;

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
                  {/* 1️⃣ 일반 텍스트(reply) */}
                  {isReply && (
                    <p className="cp-ai-text">{aiData.reply}</p>
                  )}

                  {/* 2️⃣ 견적(build/modify) */}
                  {isEstimateIntent && !isReply && (
                    <>
                      {aiData.intro && (
                        <p className="cp-ai-text">{aiData.intro}</p>
                      )}

                      {aiData.main && (
                        <EstimateTable
                          estimate={{
                            components: normalizeComponents(
                              deduplicateComponents(
                                convertMainToComponents(aiData.main)
                              ),
                            ),
                            total: aiData.total || "0",
                          }}
                        />
                      )}

                      {aiData.another_input_text && (
                        <p className="cp-ai-text">
                          {aiData.another_input_text}
                        </p>
                      )}
                    </>
                  )}

                  {/* 3️⃣ 기본 텍스트 */}
                  {!isEstimateIntent && !isReply && (
                    <p className="cp-ai-text">
                      {aiData.prompt ||
                        aiData.text ||
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
                  "{messages[messages.length - 1]?.text ||
                    "검색 중..."}" 처리 중...
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