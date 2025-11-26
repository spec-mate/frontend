// src/pages/EstimateDetail.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";

export default function EstimateDetail({ estimate, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const { setProgress, resetProgress } = useProgressStore();
  const pdfRef = useRef(null);

  const categoryMap = useMemo(
    () => ({
      cpu: "CPU",
      gpu: "그래픽카드",
      mainboard: "메인보드",
      ram: "메모리",
      ssd: "SSD",
      hdd: "HDD",
      cooler: "쿨러",
      power: "파워",
      case: "케이스",
      casefan: "케이스팬",
    }),
    []
  );

  const parsePrice = (v) => {
    if (!v) return 0;
    if (typeof v === "number") return v;
    return parseInt(String(v).replace(/,/g, ""), 10) || 0;
  };

  const fetchAiEstimateDetail = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const detailRes = await api.get(`/aiestimates/${estimate.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsRes = await api.get(
        `/aiestimates/${estimate.id}/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDetail({
        ...detailRes.data,
        products: productsRes.data,
      });
    } catch (err) {
      console.error("❌ AI 견적 상세 조회 실패:", err);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const fetchUserEstimate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`/estimate/${estimate.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetail(res.data);
    } catch (err) {
      console.error("❌ 사용자 견적 상세 조회 실패:", err);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    resetProgress();
    setProgress(20);

    if (estimate.isAi) fetchAiEstimateDetail();
    else fetchUserEstimate();
  }, [estimate]);

  if (loading || !detail) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="estimate-detail-page">
      <div ref={pdfRef} className="estimate-detail-wrapper">
        <div className="estimate-header">
          <div className="header-left">
            <h2>{detail.intro || estimate.title || "견적 상세보기"}</h2>
            <p className="estimate-subtitle">
              {detail.note || "구성된 부품 목록"}
            </p>
          </div>

          <button className="back-btn" onClick={onClose}>
            <img src="/out.svg" alt="back" className="icon" />
          </button>
        </div>

        <div className="estimate-table">
          {detail.products?.map((p) => (
            <div className="estimate-cell" key={p.id}>
              <div className="estimate-category">
                {categoryMap[p.category] || p.category}
              </div>

              <div className="product-container">
                <img
                  src={p.image || "/no-image.svg"}
                  alt={p.name}
                  className="estimate-img"
                />

                <div className="product-details">
                  <p className="meta-product-name">{p.name}</p>
                  <p className="product-price">
                    {parsePrice(p.price).toLocaleString()} 원
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 total-price 왼쪽에 PDF 버튼을 자연스럽게 배치 */}
        <div className="footer-section">
          <button className="pdf-btn-inline" onClick={() => window.print()}>
            PDF로 저장하기
          </button>

          <div className="total-price">
            총합 {(detail.totalPrice || 0).toLocaleString()} 원
          </div>
        </div>
      </div>
    </div>
  );
}
