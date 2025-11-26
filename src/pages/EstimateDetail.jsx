// src/pages/EstimateDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";

// Lazy Image
const LazyImage = React.memo(({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    style={{
      width: "140px",
      height: "140px",
      objectFit: "contain",
      borderRadius: "6px",
      background: "#fafafa",
      border: "1px solid #eee",
    }}
    onError={(e) => (e.target.src = "/no-image.svg")}
  />
));

export default function EstimateDetail({ estimate, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { progress, setProgress, resetProgress } = useProgressStore();

  /** 카테고리 매핑 */
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

  /** Price parsing */
  const parsePrice = (v) => {
    if (!v) return 0;
    if (typeof v === "number") return v;
    return parseInt(String(v).replace(/,/g, ""), 10) || 0;
  };

  /** -----------------------------------------------------------
   * 🟦 AI 견적 상세 조회 — 두 API 호출 후 merge
   * ---------------------------------------------------------- */
  const fetchAiEstimateDetail = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // 1) 기본 상세 정보
      const detailRes = await api.get(`/aiestimates/${estimate.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2) 제품 리스트(이미지 포함)
      const productsRes = await api.get(
        `/aiestimates/${estimate.id}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const detailData = detailRes.data;
      const productsData = productsRes.data;

      // 🔥 /products API 데이터에는 image가 정확히 들어있음
      setDetail({
        ...detailData,
        products: productsData,
      });
    } catch (err) {
      console.error("❌ AI 견적 상세 조회 실패:", err);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  /** -----------------------------------------------------------
   * 사용자 견적
   * ---------------------------------------------------------- */
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

  /** 초기 로드 */
  useEffect(() => {
    resetProgress();
    setProgress(20);

    if (estimate.isAi) {
      fetchAiEstimateDetail();
    } else {
      fetchUserEstimate();
    }
  }, [estimate]);

  if (loading || !detail) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="estimate-detail-page">
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
              <LazyImage src={p.image || "/no-image.svg"} alt={p.name} />

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

      <div className="total-price">
        총합 {(detail.totalPrice || 0).toLocaleString()} 원
      </div>
    </div>
  );
}
