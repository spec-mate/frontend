import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";
import Toast from "../components/Toast";

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
      gpu: "그래픽카드",
      ssd: "SSD",
      cooler: "쿨러",
      power: "파워",
      hdd: "HDD",
    }),
    [],
  );

  const apiTypeMap = useMemo(
    () => ({
      cpu: "cpu",
      gpu: "vga",
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

  const parsePrice = useCallback((price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/,/g, ""), 10) || 0;
  }, []);

  // ✅ 이미지 + 제품정보 캐시
  const productCache = useMemo(() => new Map(), []);

  // ✅ 이미지/정보 조회
  const fetchProductInfo = useCallback(
    async (category, identifier) => {
      const cacheKey = `${category}-${identifier}`;
      if (productCache.has(cacheKey)) return productCache.get(cacheKey);

      try {
        const type = apiTypeMap[category] || category;
        const res = await api.get(`/product/type/${type}`, {
          params: { size: 300 },
        });
        const list = res.data.content || [];

        const normalize = (s) =>
          String(s || "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^\w가-힣]/g, "");

        const found =
          typeof identifier === "number"
            ? list.find((p) => p.id === identifier)
            : list.find((p) =>
                normalize(p.name).includes(normalize(identifier).slice(0, 8)),
              );

        const result = {
          image: found?.image || "/no-image.svg",
          name: found?.name || "이름 없음",
          options: found?.options || {},
        };
        productCache.set(cacheKey, result);
        return result;
      } catch {
        const fallback = {
          image: "/no-image.svg",
          name: "이름 없음",
          options: {},
        };
        productCache.set(cacheKey, fallback);
        return fallback;
      }
    },
    [apiTypeMap, productCache],
  );

  /** ✅ 제품별 주요 스펙 요약 추출 */
  const getShortSpecs = useCallback((category, options = {}) => {
    if (!options || Object.keys(options).length === 0) return "";

    switch (category) {
      case "cpu":
        return [
          options.core && `${options.core}코어`,
          options.thread && `${options.thread}스레드`,
          options.boost_clock && `${options.boost_clock}`,
        ]
          .filter(Boolean)
          .join(" / ");
      case "gpu":
        return [
          options.memory && `${options.memory}`,
          options.memory_type && options.memory_type,
          options.chipset && options.chipset,
        ]
          .filter(Boolean)
          .join(" / ");
      case "ram":
        return [
          options.capacity && `${options.capacity}`,
          options.clock && `${options.clock}`,
          options.type && options.type,
        ]
          .filter(Boolean)
          .join(" / ");
      case "ssd":
      case "hdd":
        return [
          options.capacity && `${options.capacity}`,
          options.interface && options.interface,
          options.type && options.type,
        ]
          .filter(Boolean)
          .join(" / ");
      default:
        return Object.values(options).slice(0, 2).filter(Boolean).join(" / ");
    }
  }, []);

  /** ✅ 사용자 견적 */
  const fetchUserEstimateProducts = useCallback(
    async (estimateId) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get(`/estimate/${estimateId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data || [];

        const results = await Promise.allSettled(
          data.map(async (p) => {
            const info = await fetchProductInfo(p.category, p.productId);
            return {
              id: p.id,
              category: p.category,
              productId: p.productId,
              productName: info.name || p.productName,
              shortSpecs: getShortSpecs(p.category, info.options),
              image: info.image,
              unitPrice: parsePrice(p.unitPrice),
              totalPrice: parsePrice(p.totalPrice),
              quantity: p.quantity || 1,
            };
          }),
        );

        const mapped = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);
        setProducts(mapped);
      } catch (err) {
        console.error("❌ 사용자 견적 불러오기 실패:", err);
      }
    },
    [fetchProductInfo, getShortSpecs, parsePrice],
  );

  /** ✅ AI 견적 */
  const fetchAiEstimateProducts = useCallback(async () => {
    if (!estimate.components) return;
    try {
      const results = await Promise.allSettled(
        estimate.components.map(async (c, i) => {
          const info = await fetchProductInfo(c.type, c.name ?? c.productId);
          return {
            id: `ai-${i}`,
            category: c.type,
            productName: info.name,
            shortSpecs: getShortSpecs(c.type, info.options),
            image: info.image,
            unitPrice: parsePrice(c.price),
            totalPrice: parsePrice(c.price),
            quantity: 1,
          };
        }),
      );

      const mapped = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
      setProducts(mapped);
    } catch (err) {
      console.error("❌ AI 견적 처리 실패:", err);
    }
  }, [estimate, fetchProductInfo, getShortSpecs, parsePrice]);

  useEffect(() => {
    resetProgress();
    setProgress(25);
    if (estimate.id && !estimate.components)
      fetchUserEstimateProducts(estimate.id);
    else fetchAiEstimateProducts();
    setProgress(100);
  }, [
    estimate,
    fetchUserEstimateProducts,
    fetchAiEstimateProducts,
    resetProgress,
    setProgress,
  ]);

  const totalPrice = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + parsePrice(p.totalPrice ?? p.unitPrice),
        0,
      ),
    [products, parsePrice],
  );

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
                  {/* ✅ 상품명 + 간단한 스펙 */}
                  <div className="product-meta">
                    <p className="meta-product-name">{p.productName}</p>
                    {p.shortSpecs && (
                      <p className="meta-short">{p.shortSpecs}</p>
                    )}
                  </div>

                  {/* 가격/총액 */}
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
