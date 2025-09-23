import React, { useEffect, useState } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);

  // ✅ 견적 제품 불러오기
  const fetchProducts = async () => {
    try {
      const res = await api.get(`/estimate/${estimate.id}/products`);

      const productsWithImage = await Promise.all(
        res.data.map(async (p) => {
          try {
            const productRes = await api.get(`/product/${p.productId}`);
            return { ...p, image: productRes.data.image };
          } catch (innerErr) {
            console.error(`제품(${p.productId}) 상세 불러오기 실패:`, innerErr);
            return { ...p, image: null };
          }
        })
      );

      setProducts(productsWithImage);
    } catch (err) {
      console.error("견적 제품 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [estimate.id]);

  // ✅ 제품 삭제
  const handleDeleteProduct = async (estimateProductId) => {
    if (!window.confirm("이 부품을 견적에서 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/estimate/products/${estimateProductId}`);
      // 삭제 후 상태 업데이트
      setProducts((prev) => prev.filter((p) => p.id !== estimateProductId));
    } catch (err) {
      console.error("제품 삭제 실패:", err);
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
    </div>
  );
}
