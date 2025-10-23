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

  /** ✅ 이미지 찾기 (id 또는 name 기반) */
  const fetchProductImage = async (category, identifier) => {
    try {
      const type = apiTypeMap[category] || category;
      const res = await api.get(`/product/type/${type}`, {
        params: { size: 300 },
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
        const target = normalize(identifier);
        found = productList.find((p) =>
          normalize(p.name || "").startsWith(target.slice(0, 10)),
        );
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

  /** ✅ 사용자 견적 (DB 저장형) */
  const fetchUserEstimateProducts = async (estimateId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`/estimate/${estimateId}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      console.log("📦 [사용자 견적 부품 목록]", data);

      const withImages = await Promise.all(
        data.map(async (p) => {
          const image = await fetchProductImage(p.category, p.productId);
          return {
            id: p.id,
            productId: p.productId,
            productName: p.productName || "이름 없음",
            category: p.category || "-",
            image,
            unitPrice: parsePrice(p.unitPrice),
            totalPrice: parsePrice(p.totalPrice),
            quantity: p.quantity || 1,
          };
        }),
      );

      console.log("✅ [사용자 견적 최종 매핑 결과]", withImages);
      setProducts(withImages);
    } catch (err) {
      console.error("❌ 사용자 견적 제품 불러오기 실패:", err);
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
          console.log(
            `🔍 [AI 부품 매칭] index=${i}, type=${c.type}, name=${c.name}, productId=${c.productId}, price=${c.price}`,
          );

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

  /** ✅ 견적 타입 분기 */
  useEffect(() => {
    resetProgress();
    setProgress(25);

    console.log("📄 [Estimate 객체]", estimate);

    if (estimate.id && estimate.id !== "local-ai" && !estimate.components) {
      console.log("🔧 [모드] 사용자 견적 불러오기");
      fetchUserEstimateProducts(estimate.id);
    } else {
      console.log("🤖 [모드] AI 견적 불러오기");
      fetchAiEstimateProducts();
    }

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
