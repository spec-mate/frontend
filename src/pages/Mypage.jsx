// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import "./styles/Mypage.css";
import api from "../api";
import EstimateDetail from "./EstimateDetail";
import Header from "../components/Header";
import { useHeaderStore } from "../store/headerStore";

export default function MyPage() {
  const [userEstimates, setUserEstimates] = useState([]);
  const [aiEstimates, setAiEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  useEffect(() => {
    const fetchMyEstimates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        let userEstimatesList = [];
        let aiEstimatesList = [];

        // ✅ 로그인 상태일 때만 서버 견적 요청
        if (token) {
          try {
            const res = await api.get("/estimate/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("🚀 [MyPage] 내 견적 응답:", res.data);

            const allEstimates = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data.data)
                ? res.data.data
                : [];

            aiEstimatesList = allEstimates.filter(
              (e) => e.isAi === true || e.isAi === "true",
            );
            userEstimatesList = allEstimates.filter(
              (e) => !e.isAi || e.isAi === false || e.isAi === "false",
            );
          } catch (err) {
            console.warn(
              "⚠️ 서버 견적 조회 실패 (로그인 필요 없을 수 있음):",
              err,
            );
          }
        }

        // ✅ 로컬 저장된 AI 견적 병합
        const localAiList =
          JSON.parse(localStorage.getItem("aiEstimateList") || "[]") || [];

        if (Array.isArray(localAiList) && localAiList.length > 0) {
          const merged = localAiList.map((item) => ({
            ...item,
            id: item.id || `local-ai-${Date.now()}`,
            isLocal: true,
          }));
          aiEstimatesList = [...aiEstimatesList, ...merged];
        }

        setUserEstimates(userEstimatesList);
        setAiEstimates(aiEstimatesList);

        console.log("🟢 최종 사용자 견적:", userEstimatesList);
        console.log("🟢 최종 AI 견적:", aiEstimatesList);
      } catch (err) {
        console.error("❌ 견적 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEstimates();
  }, []);

  /** ✅ 견적 상세 열기 */
  const handleOpenEstimate = (estimate) => setSelectedEstimate(estimate);
  const handleCloseDetail = () => setSelectedEstimate(null);

  /** ✅ 견적 삭제 */
  const handleDelete = async (estimateId, e) => {
    e.stopPropagation();

    // ✅ 로컬 AI 견적 삭제
    if (estimateId.startsWith("local-ai")) {
      const existing = JSON.parse(
        localStorage.getItem("aiEstimateList") || "[]",
      );
      const filtered = existing.filter((item) => item.id !== estimateId);
      localStorage.setItem("aiEstimateList", JSON.stringify(filtered));
      setAiEstimates((prev) => prev.filter((e) => e.id !== estimateId));
      alert("AI 견적이 삭제되었습니다.");
      return;
    }

    // ✅ 서버 견적 삭제 (로그인 상태)
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      await api.delete(`/estimate/${estimateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserEstimates((prev) => prev.filter((item) => item.id !== estimateId));
      setAiEstimates((prev) => prev.filter((item) => item.id !== estimateId));
    } catch (err) {
      console.error("견적 삭제 실패:", err);
      if (err.response?.status === 403) {
        alert("삭제 권한이 없습니다. 다시 로그인 해주세요.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
  };

  return (
    <div className="mypage">
      <Header />

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : !selectedEstimate ? (
        <>
          <div className="mypage-header">
            <h2>{localStorage.getItem("nickname") || "유저"}</h2>
            <span className="user-role">
              스펙메이트 <span className="highlight-member">회원</span>
            </span>
          </div>

          <section className="mypage-section">
            <h3 className="section-title">
              스펙메이트 보관함 확인하기
              <img src="/arrow-right.svg" alt="→" className="arrow-icon" />
            </h3>

            {/* ✅ 사용자 견적 */}
            <div className="estimate-block">
              <h4 className="block-title">
                {localStorage.getItem("nickname") || "유저"}님의 견적
              </h4>
              <div className="estimate-grid">
                {userEstimates && userEstimates.length > 0 ? (
                  userEstimates.map((estimate) => (
                    <div
                      key={estimate.id}
                      className="estimate-card"
                      onClick={() => handleOpenEstimate(estimate)}
                    >
                      <img
                        src="/gaming.svg"
                        alt={estimate.title || "내 견적"}
                        className="estimate-image"
                      />
                      <p>{estimate.title || "사용자 견적"}</p>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDelete(estimate.id, e)}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">
                    아직 저장된 사용자 견적이 없습니다.
                  </p>
                )}
              </div>
            </div>

            {/* ✅ AI 견적 */}
            <div className="estimate-block">
              <h4 className="block-title">AI 추천 견적</h4>
              <div className="estimate-grid">
                {aiEstimates && aiEstimates.length > 0 ? (
                  aiEstimates.map((estimate) => (
                    <div
                      key={estimate.id}
                      className="estimate-card ai-card"
                      onClick={() => handleOpenEstimate(estimate)}
                    >
                      <img
                        src="/small-character.svg"
                        alt={estimate.title || "AI 견적"}
                        className="estimate-image"
                      />
                      <p>{estimate.title || "AI 추천 견적"}</p>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDelete(estimate.id, e)}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">아직 AI 추천 견적이 없습니다.</p>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        <EstimateDetail
          estimate={selectedEstimate}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
