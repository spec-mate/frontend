// src/pages/EstimateDetail.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";
import Toast from "../components/Toast";

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);
  const { progress, setProgress, resetProgress } = useProgressStore();

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

  const apiTypeMap = {
    cpu: "cpu",
    gpu: "vga",
    ram: "RAM",
    mainboard: "mainboard",
    ssd: "ssd",
    hdd: "hdd",
    power: "power",
    cooler: "cooler",
    case: "case",
  };

  const parsePrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/,/g, ""), 10) || 0;
  };

  /** ✅ 이미지 찾기 (브랜드 한↔영 변환 + fuzzy 매칭 강화 버전) */
  const fetchProductImage = async (category, identifier) => {
    try {
      const type = apiTypeMap[category] || category;
      const res = await api.get(`/product/type/${type}`, {
        params: { size: 500 },
      });
      const productList = res.data.content || [];

      let found = null;
      if (typeof identifier === "number") {
        found = productList.find((p) => p.id === identifier);
      } else if (typeof identifier === "string") {
        const normalize = (s) =>
          s
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^\w가-힣]/g, "");

        let target = normalize(identifier);

        // ✅ 브랜드명 매핑 테이블 (한 ↔ 영)
        const brandMap = {
          intel: "인텔",
          amd: "AMD",
          samsung: "삼성전자",
          seasonic: "시소닉",
          corsair: "커세어",
          asus: "에이수스",
          gigabyte: "기가바이트",
          msi: "엠에스아이",
          deepcool: "딥쿨",
        };

        Object.entries(brandMap).forEach(([eng, kor]) => {
          if (target.includes(eng)) target += kor;
          if (target.includes(kor)) target += eng;
        });

        // ✅ fuzzy 매칭
        found = productList.find((p) => {
          const name = normalize(p.name || "");
          return (
            name.includes(target.slice(0, 10)) ||
            target.includes(name.slice(0, 10))
          );
        });
      }

      if (found) {
        console.log(
          `✅ [이미지 매칭 성공] ${category} → ${found.name} (ID: ${found.id})`,
        );
      } else {
        console.warn(`⚠️ [이미지 없음] ${category} / ${identifier}`);
      }

      return found?.image || "/no-image.svg";
    } catch (err) {
      console.error(`❌ 이미지 조회 실패 (${category}, ${identifier})`, err);
      return "/no-image.svg";
    }
  };

  /** ✅ AI 견적 (LLM 생성형) */
  const fetchAiEstimateProducts = async () => {
    if (!estimate.components) return;
    console.log("🧠 [AI 견적 원본 데이터]", estimate.components);

    try {
      const withImages = await Promise.all(
        estimate.components.map(async (c, i) => {
          const identifier = c.productId ?? c.name;
          const image = await fetchProductImage(c.type, identifier);
          return {
            id: `ai-${i}`,
            productId: c.productId,
            productName: c.name,
            category: c.type,
            image,
            unitPrice: parsePrice(c.price),
            totalPrice: parsePrice(c.price),
          };
        }),
      );
      console.log("✅ [AI 견적 최종 매핑 결과]", withImages);
      setProducts(withImages);
    } catch (err) {
      console.error("❌ AI 견적 이미지 매칭 실패:", err);
    }
  };

  /** ✅ 초기 로드 */
  useEffect(() => {
    resetProgress();
    setProgress(25);
    console.log("🤖 [AI 견적 불러오기 모드]");
    fetchAiEstimateProducts();
    setProgress(100);
  }, [estimate]);

  const totalPrice = products.reduce(
    (sum, p) => sum + parsePrice(p.totalPrice ?? p.unitPrice),
    0,
  );

  return (
    <div className="estimate-detail-page">
      <div className="estimate-header">
        <div className="header-left">
          <h2>{estimate.title || "AI 견적 상세보기"}</h2>
          <p className="estimate-subtitle">
            {estimate.description || "AI가 구성한 부품 목록"}
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
                  <img src={p.image} alt={p.productName} />
                </div>
                <div className="product-details">
                  <p className="product-name">{p.productName}</p>
                  <p className="product-price">
                    {p.unitPrice
                      ? `${p.unitPrice.toLocaleString()} 원`
                      : "가격 정보 없음"}
                  </p>
                  <p className="product-desc">
                    총액 {p.totalPrice?.toLocaleString() ?? "-"} 원
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-text">AI가 구성한 부품이 없습니다.</p>
        )}
      </div>

      <div className="total-price">총합 {totalPrice.toLocaleString()} 원</div>
    </div>
  );
}
