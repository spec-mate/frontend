import React, { useEffect, useState } from "react";
import "./styles/MyPage.css";
import api from "../api";

export default function MyPage() {
  const [estimates, setEstimates] = useState([]); // 전체 견적 목록
  const [loading, setLoading] = useState(true);

  // ✅ 내 견적 목록 불러오기
  const fetchMyEstimates = async () => {
    try {
      const res = await api.get("/estimate/me"); // UserEstimateController와 연결
      setEstimates(res.data);
    } catch (err) {
      console.error("견적 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEstimates();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div className="mypage">
      <header className="mypage-header">
        <h2>{localStorage.getItem("nickname") || "유저"}</h2>
        <span className="user-role">스펙메이트 회원</span>
      </header>

      <section className="mypage-section">
        <h3 className="section-title">스펙메이트 보관함 확인하기 &gt;</h3>

        {/* 🔹 스펙메이트 AI 견적 */}
        <div className="estimate-block">
          <h4 className="block-title">스펙메이트가 만들어준 견적</h4>
          <div className="estimate-grid">
            {estimates
              .filter((e) => e.isAiGenerated) // ✅ AI 견적만
              .map((estimate) => (
                <div key={estimate.id} className="estimate-card">
                  <img src="/case.png" alt={estimate.title || "AI 견적"} />
                  <p>{estimate.title || "AI 추천 견적"}</p>
                </div>
              ))}
          </div>
        </div>

        {/* 🔹 내가 만든 견적 */}
        <div className="estimate-block">
          <h4 className="block-title">
            {localStorage.getItem("nickname") || "유저"}님이 만든 견적
          </h4>
          <div className="estimate-grid">
            {estimates
              .filter((e) => !e.isAiGenerated) // ✅ 내가 만든 견적만
              .map((estimate) => (
                <div key={estimate.id} className="estimate-card">
                  <img src="/case.png" alt={estimate.title || "내 견적"} />
                  <p>{estimate.title || "사용자 견적"}</p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
