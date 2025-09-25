// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import "./styles/Mypage.css";
import api from "../api";
import EstimateDetail from "./EstimateDetail";
import Header from "../components/Header";
import { useHeaderStore } from "../store/headerStore";

export default function MyPage() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  useEffect(() => {
    const fetchMyEstimates = async () => {
      try {
        const res = await api.get("/estimate/me");
        setEstimates(res.data);
        console.log("견적 불러오기 성공:", res.data);
      } catch (err) {
        console.error("견적 불러오기 실패:", err);
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

  const handleOpenEstimate = (estimate) => {
    setSelectedEstimate(estimate);
  };

  const handleCloseDetail = () => {
    setSelectedEstimate(null);
  };

  const handleDelete = async (estimateId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/estimate/${estimateId}`);
      setEstimates((prev) => prev.filter((item) => item.id !== estimateId));
      console.log(`견적 삭제 성공: ${estimateId}`);
    } catch (err) {
      console.error("견적 삭제 실패:", err);
      if (err.response && err.response.status === 403) {
        alert("삭제 권한이 없습니다. 다시 로그인 해주세요.");
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
  };

  return (
    <div className="mypage">
      <Header />
      {!selectedEstimate ? (
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
            <div className="estimate-block">
              <h4 className="block-title">
                {localStorage.getItem("nickname") || "유저"}님의 견적
              </h4>
              <div className="estimate-grid">
                {estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="estimate-card"
                    onClick={() => handleOpenEstimate(estimate)}
                  >
                    <img src="/gaming.svg" alt={estimate.title || "내 견적"} />
                    <p>{estimate.title || "사용자 견적"}</p>
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
