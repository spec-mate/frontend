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

  /** ✅ 카테고리 한글 변환 */
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

  /** ✅ API 카테고리 타입 매핑 */
  const apiTypeMap = useMemo(
    () => ({
      cpu: "cpu",
      vga: "vga",
      ram: "ram",
      mainboard: "mainboard",
      ssd: "ssd",
      hdd: "hdd",
      power: "power",
      cooler: "cooler",
      case: "case",
    }),
    [],
  );

  /** ✅ 가격 문자열 정규화 */
  const parsePrice = useCallback((price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/,/g, ""), 10) || 0;
  }, []);

  /** ✅ description이 JSON일 경우 파싱 */
  const parsedDesc = useMemo(() => {
    try {
      return typeof estimate.description === "string"
        ? JSON.parse(estimate.description)
        : estimate.description;
    } catch (e) {
      console.warn("⚠️ description JSON 파싱 실패:", e);
      return {};
    }
  }, [estimate.description]);

  /** ✅ JSON 내부 components 변환 */
  const parsedProducts = useMemo(() => {
    if (!parsedDesc?.components) return [];
    return parsedDesc.components.map((c, i) => ({
      id: `parsed-${i}`,
      category: c.type,
      productName: c.name,
      description: c.description,
      image: c.detail?.image || "/no-image.svg",
      unitPrice: parsePrice(c.detail?.price),
      totalPrice: parsePrice(c.detail?.price),
      quantity: 1,
    }));
  }, [parsedDesc, parsePrice]);

  /** ✅ 이미지 자동 매칭 함수 (EstimateDetailUser 버전 통합) */
  const fetchProductImage = useCallback(
    async (category, productName) => {
      try {
        const type = apiTypeMap[category] || category;
        console.log(
          `🔍 [이미지 탐색 시작] category=${category}, name=${productName}`,
        );

        const res = await api.get(`/product/type/${type}`, {
          params: { size: 300 },
        });
        const productList =
          res.data?.content && Array.isArray(res.data.content)
            ? res.data.content
            : Array.isArray(res.data)
              ? res.data
              : [];

        console.log(`📦 [${category}] 제품 ${productList.length}개 로드됨`);

        const normalize = (s) =>
          s
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            ?.replace(/[^\w가-힣]/g, "") || "";
        const target = normalize(productName);

        const found = productList.find((p) =>
          normalize(p.name).includes(target.slice(0, 10)),
        );

        if (found) {
          console.log(`✅ [이미지 매칭 성공] ${category} → ${found.name}`);
          return found.image || "/no-image.svg";
        } else {
          console.warn(`⚠️ [이미지 매칭 실패] ${category} / ${productName}`);
          return "/no-image.svg";
        }
      } catch (err) {
        console.error(
          `❌ [오류] 이미지 조회 실패 (${category}, ${productName})`,
          err,
        );
        return "/no-image.svg";
      }
    },
    [apiTypeMap],
  );

  /** ✅ 사용자 견적 로드 (이미지 매칭 포함) */
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

        const data = res.data || [];
        console.log("📦 [사용자 견적 부품 목록]", data);

        const mapped = await Promise.all(
          data.map(async (p, i) => {
            console.log(
              `🧩 [${i}] ${p.category} / ${p.productName} 이미지 탐색`,
            );
            const image =
              p.image ||
              p.imageUrl ||
              p.productImage ||
              p.product?.image ||
              (await fetchProductImage(p.category, p.productName));

            return {
              id: p.id,
              category: p.category,
              productId: p.productId,
              productName: p.productName,
              image: image || "/no-image.svg",
              unitPrice: parsePrice(p.unitPrice),
              totalPrice: parsePrice(p.totalPrice),
              quantity: p.quantity || 1,
            };
          }),
        );

        console.log("✅ [사용자 견적 최종 매핑 결과]", mapped);
        setProducts(mapped);
      } catch (err) {
        console.error("❌ [오류] 사용자 견적 불러오기 실패:", err);
      }
    },
    [fetchProductImage, parsePrice],
  );

  /** ✅ AI 견적 로드 */
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

      const targetEstimate = res.data.find((e) => e.id === estimate.id);
      if (!targetEstimate) {
        console.warn("⚠️ 일치하는 AI 견적을 찾지 못했습니다:", estimate.id);
        return;
      }

      const mapped = (targetEstimate.products || []).map((p, i) => ({
        id: p.id || `ai-${i}`,
        category: p.type,
        productName: p.matched_name || p.productName || "이름 없음",
        image:
          p.image ||
          p.imageUrl ||
          p.productImage ||
          p.product?.image ||
          "/no-image.svg",
        unitPrice: parsePrice(p.unitPrice),
        totalPrice: parsePrice(p.unitPrice) * (p.quantity || 1),
        quantity: p.quantity || 1,
      }));

      setProducts(mapped);
    } catch (err) {
      console.error("❌ [오류] AI 견적 불러오기 실패:", err);
    }
  }, [estimate.id, parsePrice]);

  /** ✅ 초기 로드 */
  useEffect(() => {
    resetProgress();
    setProgress(25);

    if (estimate.isAi) {
      fetchAiEstimateProducts();
    } else {
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
  const totalPrice = useMemo(() => {
    const list = parsedProducts.length > 0 ? parsedProducts : products;
    return list.reduce(
      (sum, p) => sum + parsePrice(p.totalPrice ?? p.unitPrice),
      0,
    );
  }, [products, parsedProducts, parsePrice]);

  /** ✅ 렌더링 */
  const renderList = parsedProducts.length > 0 ? parsedProducts : products;

  return (
    <div className="estimate-detail-page">
      <div className="estimate-header">
        <div className="header-left">
          <h2>{parsedDesc.build_name || estimate.title || "견적 상세보기"}</h2>
          <p className="estimate-subtitle">
            {parsedDesc.build_description || "구성된 부품 목록"}
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
        {renderList.length > 0 ? (
          renderList.map((p) => (
            <div className="estimate-cell" key={p.id}>
              <div className="estimate-category">
                {categoryMap[p.category] || p.category}
              </div>

              <div className="product-container">
                <div className="estimate-product-image">
                  <LazyImage src={p.image} alt={p.productName} />
                </div>

                <div className="product-details">
                  <p className="meta-product-name">{p.productName}</p>
                  <p className="product-price">
                    {p.unitPrice
                      ? `${p.unitPrice.toLocaleString()} 원`
                      : "가격 정보 없음"}
                  </p>
                  {p.description && (
                    <p className="product-desc">{p.description}</p>
                  )}
                  <p className="product-dec">
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
