import React, { useEffect, useState } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore";
import Toast from "../components/Toast";

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const { progress, setProgress, increaseProgress, resetProgress } =
    useProgressStore();

  const categoryMap = {
    ram: "메모리",
    cpu: "CPU",
    mainboard: "메인보드",
    case: "케이스",
    vga: "그래픽카드",
    ssd: "SSD",
    cooler: "쿨러",
    psu: "파워",
  };

  const fetchProducts = async () => {
    resetProgress();
    try {
      const res = await api.get(`/estimate/${estimate.id}/products`);
      setProgress(30);

      const productsWithImage = await Promise.all(
        res.data.map(async (p) => {
          try {
            const productRes = await api.get(`/product/${p.productId}`);
            increaseProgress(Math.floor(70 / res.data.length));
            return { ...p, image: productRes.data.image };
          } catch (innerErr) {
            console.error(`제품(${p.productId}) 상세 불러오기 실패:`, innerErr);
            increaseProgress(Math.floor(70 / res.data.length));
            return { ...p, image: null };
          }
        })
      );

      setProducts(productsWithImage);
      setProgress(100);
    } catch (err) {
      console.error("견적 제품 불러오기 실패:", err);
      resetProgress();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [estimate.id]);

  const handleDeleteProduct = async (estimateProductId) => {
    try {
      await api.delete(`/estimate/products/${estimateProductId}`);
      setProducts((prev) => prev.filter((p) => p.id !== estimateProductId));

      setToastMessage("성공적으로 견적을 수정했어요!");
      setToastType("success");
      setShowToast(true);
    } catch (err) {
      console.error("제품 삭제 실패:", err);

      setToastMessage("부품 삭제에 실패했습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleExpandProduct = async (category, productId) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      setRelatedProducts([]);
      return;
    }

    try {
      const res = await api.get(`/product/type/${category}?size=30`);
      setRelatedProducts(res.data.content || []);
      setExpandedProductId(productId);
    } catch (err) {
      console.error("관련 제품 불러오기 실패:", err);
    }
  };

  const handleReplaceProduct = async (estimateProductId, newProduct) => {
    try {
      // 백엔드에 교체 요청 (PUT/PATCH 엔드포인트 필요)
      await api.put(`/estimate/products/${estimateProductId}`, {
        productId: newProduct.id,
      });

      // 프론트 상태 업데이트
      const productRes = await api.get(`/product/${newProduct.id}`);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === estimateProductId
            ? {
                ...p,
                productId: newProduct.id,
                productName: newProduct.name,
                unitPrice: newProduct.price,
                image: productRes.data.image,
              }
            : p
        )
      );

      setToastMessage("부품이 성공적으로 교체되었습니다.");
      setToastType("success");
      setShowToast(true);

      // 드롭다운 닫기
      setExpandedProductId(null);
      setRelatedProducts([]);
    } catch (err) {
      console.error("부품 교체 실패:", err);
      setToastMessage("부품 교체에 실패했습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const totalPrice = products.reduce((sum, p) => sum + (p.unitPrice || 0), 0);

  return (
    <div className="estimate-detail-page">
      <div className="estimate-header">
        <div className="header-left">
          <h2>
            <span className="estimate-date">
              {new Date(estimate.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                weekday: "short",
              })}
            </span>
          </h2>
          <p className="estimate-subtitle">화이트계열의 사무용 PC 조합</p>
        </div>
        <div className="header-actions">
          <button className="trash-btn">
            <img src="/trash.svg" alt="삭제" className="icon" />
          </button>
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
                <div className="product-top">
                  <button
                    className="product-name-dropdown"
                    onClick={() => handleExpandProduct(p.category, p.id)}
                  >
                    {p.productName}
                  </button>
                  {expandedProductId === p.id && (
                    <ul className="related-product-list">
                      {relatedProducts.map((rp) => (
                        <li
                          key={rp.id}
                          onClick={() => handleReplaceProduct(p.id, rp)}
                        >
                          {rp.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="spacer"></div>

                <div className="product-bottom-section">
                  <p className="price-label">가격</p>
                  <div className="product-bottom">
                    <p className="product-price">
                      {p.unitPrice.toLocaleString()}{" "}
                      <span className="currency-unit">원</span>
                    </p>
                    <div className="product-actions">
                      <img
                        src="/trash.svg"
                        alt="삭제"
                        className="delete-icon"
                        onClick={() => handleDeleteProduct(p.id)}
                      />
                      <button className="detail-btn">상세보기</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="total-price">최저가 {totalPrice.toLocaleString()} 원</div>

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
