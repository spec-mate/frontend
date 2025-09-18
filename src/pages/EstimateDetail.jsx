import React, { useEffect, useState } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";

export default function EstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 견적에 포함된 제품 목록 가져오기
        const res = await api.get(`/estimate/${estimate.id}/products`);

        // 각 제품별로 productId로 다시 API 호출 → 이미지 등 상세 데이터 추가
        const productsWithImage = await Promise.all(
          res.data.map(async (p) => {
            try {
              const productRes = await api.get(`/product/${p.productId}`);
              return { ...p, image: productRes.data.image };
            } catch (innerErr) {
              console.error(
                `제품(${p.productId}) 상세 불러오기 실패:`,
                innerErr
              );
              return { ...p, image: null };
            }
          })
        );

        setProducts(productsWithImage);
      } catch (err) {
        console.error("견적 제품 불러오기 실패:", err);
      }
    };
    fetchProducts();
  }, [estimate.id]);

  // ✅ 모든 부품 가격 합산
  const totalPrice = products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  return (
    <div className="estimate-detail-page">
      <button className="back-btn" onClick={onClose}>
        ← 목록으로
      </button>

      <h2>{estimate.title}</h2>
      <p>{new Date(estimate.createdAt).toLocaleDateString()}</p>

      <div className="product-list">
        {products.map((p) => (
          <div key={p.id} className="product-row">
            {/* 부품 카테고리 */}
            <div className="product-category">{p.category}</div>

            {/* 이미지 */}
            <div className="product-image">
              <img
                src={p.image || "/no-image.svg"} // ✅ 수정된 부분
                alt={p.productName}
              />
            </div>

            {/* 오른쪽 정보 */}
            <div className="product-details">
              <p className="product-name">{p.productName}</p>
              <p className="product-price">
                {p.unitPrice.toLocaleString()} 원 × {p.quantity}
              </p>
              <p className="product-total">
                합계: {(p.totalPrice || 0).toLocaleString()} 원
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ 총합 가격 */}
      <div className="total-price">
        총 합계: {totalPrice.toLocaleString()} 원
      </div>
    </div>
  );
}
