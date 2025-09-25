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

  const { progress, setProgress, increaseProgress, resetProgress } =
    useProgressStore();

  const categoryMap = {
    ram: "메모리",
    mainboard: "메인보드",
    case: "케이스",
    cpu: "CPU",
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

  const totalPrice = products.reduce((sum, p) => sum + (p.unitPrice || 0), 0);

  return (
    <div className="estimate-detail-page">
      <div className="top-actions">
        <button className="back-btn" onClick={onClose}>
          <img src="/out.svg" alt="목록으로" className="icon" />
        </button>
      </div>

      <h2>{estimate.title}</h2>
      <p>{new Date(estimate.createdAt).toLocaleDateString()}</p>

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
            <div className="product-box">
              <div className="estimate-product-image">
                <img src={p.image || "/no-image.svg"} alt={p.productName} />
              </div>
              <div className="product-info">
                <p className="product-name">{p.productName}</p>
                <div className="product-bottom">
                  <p className="product-price">
                    {p.unitPrice.toLocaleString()} 원
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
