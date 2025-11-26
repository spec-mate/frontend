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
        {/* Breadcrumb */}
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

        {/* Title */}
        <h2 className="product-title">{product.name}</h2>

        {/* Tags */}
        <div className="tags">
          <span>#{product.manufacturer}</span>
          <span>#{product.category}</span>
        </div>

        {/* Main Grid */}
        <div className="product-box">
          {/* LEFT */}
          <div className="box-flex">
            <div className="box-image">
              <img
                src={product.image}
                alt={product.name}
                className="product-detail-image"
              />
            </div>

            <div className="box-spec">
              <div className="spec-title">제품 상세 정보</div>

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

          {/* RIGHT: 가격 영역 */}
          <div className="price-box">
            <span className="price-label">가격</span>

            <strong className="price-value">
              <span className="price-number">
                {product.price
                  ? Number(product.price).toLocaleString()
                  : "정보 없음"}
              </span>
              {product.price && <span className="price-won"> 원</span>}
            </strong>

            <div className="price-actions">
              <button
                className="link-btn"
                onClick={() => window.open(product.productLink, "_blank")}
              >
                <img src="/vector.svg" alt="상품 링크" className="link-icon" />
              </button>

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

        {/* 설명 영역 */}
        <div className="product-description-box">
          <div className="desc-header">
            <div className="desc-avatar-wrapper">
              <img src="/small-character.svg" className="desc-avatar" />
            </div>

            <div className="desc-text-group">
              <span className="desc-title">스펙메이트의 제품 소개</span>
              <p className="desc-subtext">
                스펙메이트가 제품을 직접 분석했어요! 선택에 도움이 되었으면
                좋겠어요 :)
              </p>
            </div>
          </div>

          <div className="desc-bubble">
            {product.description || "등록된 설명이 없습니다."}
          </div>
        </div>
      </div>

      {/* Modal */}
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

      {/* Toast */}
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
