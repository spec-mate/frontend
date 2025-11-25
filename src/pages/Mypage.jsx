// src/pages/Mypage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./styles/Mypage.css";
import api from "../api";
import EstimateDetail from "./EstimateDetail";
import Header from "../components/Header";
import { useHeaderStore } from "../store/headerStore";
import UserEstimateDetail from "./UserEstimateDetail";

// LazyImage (React.memo + lazy loading)
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

  // 헤더 색상 설정
  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("black");
  }, []);

  // 견적 데이터 로드
  useEffect(() => {
    const fetchAllEstimates = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, aiRes] = await Promise.all([
          api.get("/estimate/me", { headers }),
          api.get("/aiestimates/me", { headers }),
        ]);

        const userData = Array.isArray(userRes.data)
          ? userRes.data
          : Array.isArray(userRes.data.data)
            ? userRes.data.data
            : [];

        const aiData = Array.isArray(aiRes.data)
          ? aiRes.data
          : Array.isArray(aiRes.data.data)
            ? aiRes.data.data
            : [];

        setUserEstimates(userData);
        setAiEstimates(aiData);

        console.log("📦 사용자 견적 개수:", userData.length);
        console.log("🧠 AI 견적 개수:", aiData.length);
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

    fetchAllEstimates();
  }, []);

  // 선택한 견적 상세 열기
  const handleOpenEstimate = useCallback((estimate) => {
    console.log("🔍 선택된 estimate:", estimate);

    const realId =
      estimate.id ??
      estimate.estimateId ??
      estimate.estimate_id ??
      estimate.estimateID ??
      estimate.estimate_id;

    if (!realId) {
      console.error("🚨 견적 ID 추출 실패:", estimate);
      return;
    }

    setSelectedEstimate({
      ...estimate,
      id: realId,
      isAi: estimate.isAi === true,
    });
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedEstimate(null);
  }, []);

  // 견적 삭제
  const handleDelete = useCallback(async (estimateId, e, isAi = false) => {
    e.stopPropagation();

    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const endpoint = isAi
        ? `/aiestimates/${estimateId}`
        : `/estimate/${estimateId}`;

      await api.delete(endpoint, { headers });

      if (isAi) {
        setAiEstimates((prev) => prev.filter((item) => item.id !== estimateId));
      } else {
        setUserEstimates((prev) =>
          prev.filter((item) => item.id !== estimateId)
        );
      }
    } catch (err) {
      console.error("❌ 견적 삭제 실패:", err);

      const confirmForceDelete = window.confirm(
        "삭제 실패했습니다. 목록에서 강제로 제거하시겠습니까?"
      );

      if (confirmForceDelete) {
        if (isAi) {
          setAiEstimates((prev) =>
            prev.filter((item) => item.id !== estimateId)
          );
        } else {
          setUserEstimates((prev) =>
            prev.filter((item) => item.id !== estimateId)
          );
        }
      }
    }
  }, []);

  const nickname = useMemo(
    () => localStorage.getItem("nickname") || "유저",
    []
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
                        onClick={(e) => handleDelete(estimate.id, e, false)}
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
                      onClick={() =>
                        handleOpenEstimate({ ...estimate, isAi: true })
                      }
                    >
                      <LazyImage
                        src="/small-character.svg"
                        alt={estimate.title || "AI 견적"}
                      />
                      <p>{estimate.title || "AI 추천 견적"}</p>
                      <button
                        className="delete-estimate-btn"
                        onClick={(e) => handleDelete(estimate.id, e, true)}
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
      ) : selectedEstimate.isAi ? (
        <EstimateDetail
          estimate={selectedEstimate}
          onClose={handleCloseDetail}
        />
      ) : (
        <UserEstimateDetail
          estimate={selectedEstimate}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
