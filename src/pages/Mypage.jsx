// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import "./styles/Mypage.css";
import api from "../api";
import EstimateDetail from "./EstimateDetail"; // 상세 페이지 컴포넌트 분리
import Header from "../components/Header"; // ✅ 헤더 import
import { useHeaderStore } from "../store/headerStore"; // ✅ 헤더 상태 관리

export default function MyPage() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  // ✅ 페이지 진입 시 헤더 흰색으로 고정
  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  // ✅ 내 견적 불러오기
  useEffect(() => {
    const fetchMyEstimates = async () => {
      try {
        const res = await api.get("/estimate/me");
        setEstimates(res.data);
        console.log("✅ 견적 불러오기 성공:", res.data);
      } catch (err) {
        console.error("❌ 견적 불러오기 실패:", err);

        // 403 처리 → 로그인 만료 or 권한 없음
        if (err.response && err.response.status === 403) {
          alert("접근 권한이 없습니다. 다시 로그인 해주세요.");
          sessionStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyEstimates();
  }, []);

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
      await api.delete(`/estimate/${estimateId}`);
      setEstimates((prev) => prev.filter((item) => item.id !== estimateId));
      console.log(`🗑️ 견적 삭제 성공: ${estimateId}`);
    } catch (err) {
      console.error("❌ 견적 삭제 실패:", err);

      if (err.response && err.response.status === 403) {
        alert("삭제 권한이 없습니다. 다시 로그인 해주세요.");
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
  };

  return (
    <div className="mypage">
      {/* ✅ 상단 헤더 */}
      <Header />

      {!selectedEstimate ? (
        <>
          {/* 🔹 유저 정보 블록 */}
          <div className="mypage-header">
            <h2>{localStorage.getItem("nickname") || "유저"}</h2>
            <span className="user-role">
              스펙메이트 <span className="highlight-member">회원</span>
            </span>
          </div>

          {/* 🔹 견적 목록 */}
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
