// src/pages/EstimateDetail.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";
import Toast from "../components/Toast";

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const { progress, setProgress, resetProgress } = useProgressStore();

  /** ✅ AI type → 실제 product API type 매핑 */
  const typeMap = {
    vga: "gpu",
    RAM: "ram",
    cpu: "cpu",
    mainboard: "mainboard",
    ssd: "ssd",
    hdd: "hdd",
    power: "power",
    cooler: "cooler",
    case: "case",
  };

  const categoryMap = {
    ram: "메모리",
    cpu: "CPU",
    mainboard: "메인보드",
    case: "케이스",
    gpu: "그래픽카드",
    ssd: "SSD",
    cooler: "쿨러",
    power: "파워",
    hdd: "HDD",
  };

  const normalize = (s) =>
    s
      ?.toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^\w가-힣]/g, "");

  const parsePrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/,/g, ""), 10) || 0;
  };

  /** ✅ 각 type별 product 목록 불러오기 */
  const fetchTypeProducts = async (type) => {
    try {
      const res = await api.get(`/product/type/${type}`, {
        params: { size: 1000 },
      });
      return res.data.content || [];
    } catch (err) {
      console.error(`${type} 상품 목록 로드 실패`, err);
      return [];
    }
  };

  /** ✅ 이름으로 이미지 매칭 (정규화 기반) */
  const findImageByName = (name, list) => {
    if (!name || !list) return null;
    const target = normalize(name);
    const matched = list.find((p) => {
      const candidate = normalize(p.name);
      return candidate.includes(target) || target.includes(candidate);
    });
    return matched?.image || null;
  };

  /** ✅ 전체 매칭 프로세스 */
  const fetchProducts = async () => {
    resetProgress();
    setProgress(25);

    if (!estimate.components) return;

    // 1️⃣ 필요한 타입들 추출 후 /product/type/{type} 캐싱
    const uniqueTypes = [
      ...new Set(estimate.components.map((c) => typeMap[c.type] || c.type)),
    ];
    const productCache = {};
    for (const t of uniqueTypes) {
      productCache[t] = await fetchTypeProducts(t);
    }

    // 2️⃣ 각 부품 이름으로 실제 상품 이미지 매칭
    const mapped = estimate.components.map((c, i) => {
      const actualType = typeMap[c.type] || c.type;
      const image =
        findImageByName(c.name, productCache[actualType]) || "/no-image.svg";
      return {
        id: `local-${i}`,
        productName: c.name,
        category: actualType,
        image,
        unitPrice: parsePrice(c.price),
        description: c.description,
      };
    });

    setProducts(mapped);
    setProgress(100);
  };

  useEffect(() => {
    fetchProducts();
  }, [estimate]);

  const totalPrice = products.reduce(
    (sum, p) => sum + parsePrice(p.unitPrice),
    0,
  );

  return (
    <div className="estimate-detail-page">
      <div className="estimate-header">
        <div className="header-left">
          <h2>
            <span className="estimate-date">
              {new Date(estimate.createdAt || Date.now()).toLocaleDateString(
                "ko-KR",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                },
              )}
            </span>
          </h2>
          <p className="estimate-subtitle">
            {estimate.description || "AI 추천 PC 구성"}
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
        {products.map((p) => (
          <div className="estimate-cell" key={p.id}>
            <div className="estimate-category">
              {categoryMap[p.category] || p.category}
            </div>
            <div className="product-container">
              <div className="estimate-product-image">
                <img src={p.image || "/no-image.svg"} alt={p.productName} />
              </div>
              <div className="product-details">
                <p className="product-name">{p.productName}</p>
                <p className="product-price">
                  {p.unitPrice
                    ? `${parsePrice(p.unitPrice).toLocaleString()} 원`
                    : "가격 정보 없음"}
                </p>
                {p.description && (
                  <p className="product-desc">{p.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="total-price">총합 {totalPrice.toLocaleString()} 원</div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
