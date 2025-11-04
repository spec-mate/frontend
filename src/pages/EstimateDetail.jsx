// src/pages/EstimateDetail.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";

// ✅ LazyImage (React.memo + lazy loading)
const LazyImage = React.memo(({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    style={{
      width: "150px",
      height: "150px",
      objectFit: "contain",
      borderRadius: "6px",
      background: "#fafafa",
      border: "1px solid #eee",
    }}
    onError={(e) => {
      e.target.src = "/no-image.svg"; // fallback
    }}
  />
));

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);
  const { progress, setProgress, resetProgress } = useProgressStore();

  const categoryMap = useMemo(
    () => ({
      ram: "메모리",
      cpu: "CPU",
      mainboard: "메인보드",
      case: "케이스",
      vga: "그래픽카드",
      ssd: "SSD",
      cooler: "쿨러",
      power: "파워",
      hdd: "HDD",
    }),
    [],
  );

  const parsePrice = useCallback((price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/,/g, ""), 10) || 0;
  }, []);

  /** ✅ 사용자 견적 로드 (GET /estimate/:id/products) */
  const fetchUserEstimateProducts = useCallback(
    async (estimateId) => {
      console.log("📡 [API 호출] 사용자 견적 불러오기:", estimateId);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.warn("⚠️ 토큰 없음 — 로그인 필요");
          return;
        }

        const res = await api.get(`/estimate/${estimateId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ [응답 데이터]", res.data);
        const data = res.data || [];

        const mapped = data.map((p) => ({
          id: p.id,
          category: p.category,
          productId: p.productId,
          productName: p.productName,
          // ✅ 백엔드 매핑 자동 감지
          image:
            p.image ||
            p.imageUrl ||
            p.productImage ||
            p.product?.image ||
            p.product?.imageUrl ||
            "/no-image.svg",
          unitPrice: parsePrice(p.unitPrice),
          totalPrice: parsePrice(p.totalPrice),
          quantity: p.quantity || 1,
        }));

        console.log("🧩 [매핑된 사용자 견적]", mapped);
        setProducts(mapped);
      } catch (err) {
        console.error("❌ [오류] 사용자 견적 불러오기 실패:", err);
      }
    },
    [parsePrice],
  );

  /** ✅ AI 견적 로드 (GET /aiestimates/me) */
  const fetchAiEstimateProducts = useCallback(async () => {
    console.log("📡 [API 호출] AI 견적 불러오기 시작");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("⚠️ 토큰 없음 — 로그인 필요");
        return;
      }

      const res = await api.get("/aiestimates/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ [응답 전체 AI 견적 데이터]", res.data);

      const targetEstimate = res.data.find((e) => e.id === estimate.id);
      if (!targetEstimate) {
        console.warn("⚠️ 일치하는 AI 견적을 찾지 못했습니다:", estimate.id);
        return;
      }

      console.log("🎯 [선택된 AI 견적]", targetEstimate);

      const mapped = (targetEstimate.products || []).map((p, i) => ({
        id: p.id || `ai-${i}`,
        category: p.type,
        productName: p.matched_name || p.productName || "이름 없음",
        // ✅ 백엔드 매핑 자동 감지
        image:
          p.image ||
          p.imageUrl ||
          p.productImage ||
          p.product?.image ||
          p.product?.imageUrl ||
          "/no-image.svg",
        unitPrice: parsePrice(p.unitPrice),
        totalPrice: parsePrice(p.unitPrice) * (p.quantity || 1),
        quantity: p.quantity || 1,
      }));

      console.log("🧩 [매핑된 AI 견적 제품]", mapped);
      setProducts(mapped);
    } catch (err) {
      console.error("❌ [오류] AI 견적 불러오기 실패:", err);
    }
  }, [estimate.id, parsePrice]);

  /** ✅ 최초 렌더링 시 API 호출 */
  useEffect(() => {
    console.log("🚀 [INIT] EstimateDetail 컴포넌트 진입");
    console.log("📦 estimate 데이터:", estimate);

    resetProgress();
    setProgress(25);

    if (estimate.isAi) {
      console.log("➡️ [분기] AI 견적 로드 실행 (/aiestimates/me)");
      fetchAiEstimateProducts();
    } else {
      console.log("➡️ [분기] 사용자 견적 로드 실행 (/estimate/:id/products)");
      fetchUserEstimateProducts(estimate.id);
    }

    setProgress(100);
  }, [
    estimate,
    fetchUserEstimateProducts,
    fetchAiEstimateProducts,
    resetProgress,
    setProgress,
  ]);

  /** ✅ 총합 계산 */
  const totalPrice = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + parsePrice(p.totalPrice ?? p.unitPrice),
        0,
      ),
    [products, parsePrice],
  );

  /** ✅ 렌더링 */
  return (
    <div className="estimate-detail-page">
      <div className="estimate-header">
        <div className="header-left">
          <h2>{estimate.title || "견적 상세보기"}</h2>
          <p className="estimate-subtitle">
            {estimate.description || "구성된 부품 목록"}
          </p>
        </div>
        <div className="header-actions">
          <button className="back-btn" onClick={onClose}>
            <img src="/out.svg" alt="목록으로" className="icon" />
          </button>
        </div>
      </div>

      {progress < 100 && (
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="estimate-table">
        {products.length > 0 ? (
          products.map((p) => (
            <div className="estimate-cell" key={p.id}>
              <div className="estimate-category">
                {categoryMap[p.category] || p.category}
              </div>

              <div className="product-container">
                <div className="estimate-product-image">
                  <LazyImage src={p.image} alt={p.productName} />
                </div>

                <div className="product-details">
                  <div className="product-meta">
                    <p className="meta-product-name">{p.productName}</p>
                  </div>

                  <p className="product-price">
                    {p.unitPrice
                      ? `${p.unitPrice.toLocaleString()} 원`
                      : "가격 정보 없음"}
                  </p>
                  <p className="product-desc">
                    {p.quantity ? `수량 ${p.quantity}개 / ` : ""}
                    총액 {p.totalPrice?.toLocaleString() ?? "-"} 원
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-text">구성된 부품이 없습니다.</p>
        )}
      </div>

      <div className="total-price">총합 {totalPrice.toLocaleString()} 원</div>
    </div>
  );
}
