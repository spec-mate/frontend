import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./styles/Mypage.css";
import api from "../api";
import EstimateDetail from "./EstimateDetail";
import Header from "../components/Header";
import { useHeaderStore } from "../store/headerStore";

// ✅ LazyImage 컴포넌트 (React.memo + lazy load)
const LazyImage = React.memo(({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    style={{
      width: "100%",
      height: "auto",
      borderRadius: "8px",
      display: "block",
      willChange: "transform, opacity",
      transform: "translateZ(0)",
      backfaceVisibility: "hidden",
    }}
  />
));

export default function MyPage() {
  const [userEstimates, setUserEstimates] = useState([]);
  const [aiEstimates, setAiEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  // ✅ 헤더 색상 설정
  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("black");
  }, []);

  // ✅ 견적 데이터 로드
  useEffect(() => {
    const fetchMyEstimates = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get("/estimate/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allEstimates = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];

        const aiEstimatesList = allEstimates.filter(
          (e) => e.isAi === true || e.isAi === "true",
        );
        const userEstimatesList = allEstimates.filter(
          (e) => !e.isAi || e.isAi === false || e.isAi === "false",
        );

        // ✅ 로컬 저장된 AI 견적 추가
        const localAiList = JSON.parse(
          localStorage.getItem("aiEstimateList") || "[]",
        );
        localAiList.forEach((item) => {
          item.id = item.id || `local-ai-${Date.now()}`;
        });

        setUserEstimates(userEstimatesList);
        setAiEstimates([...aiEstimatesList, ...localAiList]);
      } catch (err) {
        console.error("❌ 견적 불러오기 실패:", err);
        if (err.response?.status === 403) {
          alert("접근 권한이 없습니다. 다시 로그인 해주세요.");
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyEstimates();
  }, []);

  // ✅ 상세 보기 / 닫기 핸들러
  const handleOpenEstimate = useCallback((estimate) => {
    setSelectedEstimate(estimate);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedEstimate(null);
  }, []);

  // ✅ 견적 삭제
  const handleDelete = useCallback(async (estimateId, e) => {
    e.stopPropagation();

    // 로컬 AI 견적 삭제
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

    try {
      const token = localStorage.getItem("accessToken");
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
  }, []);

  const nickname = useMemo(
    () => localStorage.getItem("nickname") || "유저",
    [],
  );

  return (
    <div className="mypage">
      <Header />

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : !selectedEstimate ? (
        <>
          {/* 헤더 */}
          <div className="mypage-header">
            <h2>{nickname}</h2>
            <span className="user-role">
              스펙메이트 <span className="highlight-member">회원</span>
            </span>
          </div>

          <section className="mypage-section">
            <h3 className="section-title">
              스펙메이트 보관함 확인하기
              <img src="/arrow-right.svg" alt="→" className="arrow-icon" />
            </h3>

            {/* 사용자 견적 */}
            <div className="estimate-block">
              <h4 className="block-title">{nickname}님의 견적</h4>
              <div className="estimate-grid">
                {userEstimates.length > 0 ? (
                  userEstimates.map((estimate) => (
                    <div
                      key={estimate.id}
                      className="estimate-card"
                      onClick={() => handleOpenEstimate(estimate)}
                    >
                      <LazyImage
                        src="/gaming.svg"
                        alt={estimate.title || "내 견적"}
                      />
                      <p>{estimate.title || "사용자 견적"}</p>
                      <button
                        className="delete-estimate-btn"
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

            {/* AI 견적 */}
            <div className="estimate-block">
              <h4 className="block-title">AI 추천 견적</h4>
              <div className="estimate-grid">
                {aiEstimates.length > 0 ? (
                  aiEstimates.map((estimate) => (
                    <div
                      key={estimate.id}
                      className="estimate-card ai-card"
                      onClick={() => handleOpenEstimate(estimate)}
                    >
                      <LazyImage
                        src="/small-character.svg"
                        alt={estimate.title || "AI 견적"}
                      />
                      <p>{estimate.title || "AI 추천 견적"}</p>
                      <button
                        className="delete-estimate-btn"
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
