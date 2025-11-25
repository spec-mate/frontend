import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "./styles/ProductDetailView.css";
import EstimateSelectModal from "../components/EstimateSelectModal";

export default function ProductDetailView() {
  const { productName, id } = useParams();

  const [product, setProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("상품 불러오기 실패:", err);
      }
    };
    load();
  }, [id]);

  if (!product) return <p>상품 불러오는 중...</p>;

  return (
    <div className="product-detail-view">
      <div className="product-content">
        <div className="breadcrumb">
          <Link to="/info" className="breadcrumb-link">
            PC 부품 정보
          </Link>
          {" > "}
          <Link
            to={`/product/${encodeURIComponent(productName)}`}
            className="breadcrumb-link"
          >
            {product.category}
          </Link>
          {" > "}
          <span>{product.name}</span>
        </div>

        <h2 className="product-title">{product.name}</h2>

        <div className="tags">
          <span>#{product.manufacturer}</span>
          <span>#{product.category}</span>
        </div>

        <div className="product-box">
          <div className="box-flex">
            {/* 이미지 */}
            <div className="box-image">
              <img
                src={product.image}
                alt={product.name}
                className="product-detail-image"
              />
            </div>

            {/* 🔥 스펙: product.specs만 출력 */}
            <div className="box-spec">
              <div className="specs-raw-box">
                {Array.isArray(product.specs) && product.specs.length > 0 ? (
                  product.specs.map((item, idx) => (
                    <span key={idx}>
                      <span className="spec-item">{item}</span>
                      {idx < product.specs.length - 1 && (
                        <span className="spec-divider"> / </span>
                      )}
                    </span>
                  ))
                ) : (
                  <p>스펙 정보가 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* 가격 */}
          <div className="price-box">
            <span className="price-label">최저가</span>
            <strong className="price-value">
              {product.price
                ? Number(product.price).toLocaleString() + " 원"
                : "정보 없음"}
            </strong>

            <div className="price-actions">
              <button className="cart-btn" onClick={() => setShowModal(true)}>
                <span className="btn-icon">
                  <img src="/cart.svg" alt="장바구니" />
                </span>
                <div className="cart-text">
                  <small className="cart-subtitle">나만의 견적 보관함</small>
                  <span className="cart-main">보관하기</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <EstimateSelectModal
          product={product}
          onClose={() => setShowModal(false)}
          onSuccess={(msg, type = "success") => {
            setToastMessage(msg);
            setToastType(type);
            setShowToast(true);
            setShowModal(false);
          }}
        />
      )}

      {/* 토스트 */}
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
