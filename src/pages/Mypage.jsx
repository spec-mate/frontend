// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import "./styles/Mypage.css";
import api from "../api";
import EstimateDetail from "./EstimateDetail"; // 상세 페이지 컴포넌트 분리

export default function MyPage() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  // ✅ 내 견적 불러오기
  useEffect(() => {
    const fetchMyEstimates = async () => {
      try {
        const res = await api.get("/estimate/me");
        setEstimates(res.data);
      } catch (err) {
        console.error("견적 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEstimates();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  // ✅ 견적 카드 클릭 → 상세 화면 열기
  const handleOpenEstimate = (estimate) => {
    setSelectedEstimate(estimate);
  };

  // ✅ 닫기 버튼 → 목록으로 돌아가기
  const handleCloseDetail = () => {
    setSelectedEstimate(null);
  };

  // ✅ 견적 삭제
  const handleDelete = async (estimateId, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    try {
      await api.delete(`/estimate/${estimateId}`); // 토큰은 api.js 인터셉터에서 자동 추가됨
      setEstimates((prev) => prev.filter((item) => item.id !== estimateId));
    } catch (err) {
      console.error("견적 삭제 실패:", err);
    }
  };

  return (
    <div className="mypage">
      {!selectedEstimate ? (
        <>
          {/* 🔹 header → div 로 변경 */}
          <div className="mypage-header">
            <h2>{localStorage.getItem("nickname") || "유저"}</h2>
            <span className="user-role">스펙메이트 회원</span>
          </div>

          <section className="mypage-section">
            <h3 className="section-title">스펙메이트 보관함 확인하기 &gt;</h3>
            <div className="estimate-block">
              <h4 className="block-title">
                {localStorage.getItem("nickname") || "유저"}님의 견적
              </h4>
              <div className="estimate-grid">
                {estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="estimate-card"
                    style={{
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => handleOpenEstimate(estimate)}
                  >
                    <img src="/gaming.svg" alt={estimate.title || "내 견적"} />
                    <p>{estimate.title || "사용자 견적"}</p>

                    {/* ✅ 견적 삭제 버튼 */}
                    <button
                      className="delete-estimate-btn"
                      onClick={(e) => handleDelete(estimate.id, e)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
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
