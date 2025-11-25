// src/pages/UserEstimateDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import "./styles/EstimateDetail.css";
import html2pdf from "html2pdf.js";

export default function UserEstimateDetail({ estimate, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const pdfRef = useRef(null);

  const estimateId =
    estimate?.id || estimate?.estimateId || estimate?.estimate_id;

  useEffect(() => {
    if (!estimateId) return;

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await api.get(`/estimate/${estimateId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts(res.data);
      } catch (err) {
        console.error("❌ 사용자 견적 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [estimateId]);

  if (!estimateId) return <div>견적 정보를 불러오는 중...</div>;
  if (loading) return <div>불러오는 중...</div>;

  /** ---------------------------------------------------------
   * 🟦 PDF 저장 (html2pdf.js)
   * --------------------------------------------------------*/
  const downloadPDF = () => {
    const element = pdfRef.current;

    const opt = {
      margin: 10,
      filename: `${estimate.title || "estimate"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="estimate-detail-page">
      <button className="pdf-btn" onClick={downloadPDF}>
        PDF로 저장하기
      </button>

      <div ref={pdfRef} className="estimate-detail-wrapper">
        <div className="estimate-header">
          <div className="header-left">
            <h2>{estimate.title || "사용자 견적"}</h2>
            <p className="estimate-subtitle">구성된 부품 목록</p>
          </div>

          <button className="back-btn" onClick={onClose}>
            <img src="/out.svg" alt="back" className="icon" />
          </button>
        </div>

        <div className="estimate-table">
          {products.length === 0 ? (
            <p>제품 정보가 비어 있습니다.</p>
          ) : (
            products.map((p) => (
              <div className="estimate-cell" key={p.id}>
                <div className="estimate-category">{p.category}</div>

                <div className="product-container">
                  <img
                    src={p.image}
                    alt={p.productName}
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "contain",
                      borderRadius: "6px",
                      background: "#fafafa",
                      border: "1px solid #eee",
                    }}
                    onError={(e) => (e.target.src = "/no-image.svg")}
                  />

                  <div className="product-details">
                    <p className="meta-product-name">{p.productName}</p>
                    <p className="product-price">
                      {p.unitPrice.toLocaleString()} 원
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="total-price">
          총합 {(estimate.totalPrice || 0).toLocaleString()} 원
        </div>
      </div>
    </div>
  );
}
