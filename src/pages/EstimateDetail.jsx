import React, { useEffect, useState } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import { useProgressStore } from "../store/progressStore"; // ✅ 진행률 스토어
import Toast from "../components/Toast"; // ✅ 토스트 컴포넌트

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success | error

  const { progress, setProgress, increaseProgress, resetProgress } =
    useProgressStore();

  // ✅ 견적 제품 불러오기
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

  // ✅ 제품 삭제 (결과만 토스트로 표시)
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

  // ✅ 모든 부품 가격 합산
  const totalPrice = products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  return (
    <div className="estimate-detail-page">
      <button className="back-btn" onClick={onClose}>
        ← 목록으로
      </button>

      <h2>{estimate.title}</h2>
      <p>{new Date(estimate.createdAt).toLocaleDateString()}</p>

      {/* ✅ 로딩 프로그레스 바 */}
      {progress < 100 && (
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="estimate-products">
        {products.map((p) => (
          <div key={p.id} className="estimate-product-row">
            {/* 카테고리 */}
            <div className="estimate-product-category">{p.category}</div>

            {/* 이미지 */}
            <div className="estimate-product-image">
              <img src={p.image || "/no-image.svg"} alt={p.productName} />
            </div>

            {/* 상세 정보 */}
            <div className="estimate-product-details">
              <p className="estimate-product-name">{p.productName}</p>
              <p className="estimate-product-price">
                {p.unitPrice.toLocaleString()} 원 × {p.quantity}
              </p>
              <p className="estimate-product-total">
                합계: {(p.totalPrice || 0).toLocaleString()} 원
              </p>
            </div>

            {/* 삭제 버튼 */}
            <div className="estimate-product-actions">
              <button
                className="delete-product-btn"
                onClick={() => handleDeleteProduct(p.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 총합 */}
      <div className="total-price">
        총 합계: {totalPrice.toLocaleString()} 원
      </div>

      {/* ✅ 토스트 메시지 */}
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
