import React, { useState, useCallback } from "react";
import "./EstimatePreviewModal.css";
import EstimateDetail from "../pages/EstimateDetail.jsx";

export default function EstimatePreviewModal({ estimate, onClose }) {
  const components = estimate.products || estimate.components || [];

  // ✅ 상세 보기용 상태
  const [selectedComponent, setSelectedComponent] = useState(null);

  // ✅ 상세 보기 열기
  const handleOpenDetail = useCallback((component) => {
    setSelectedComponent(component);
  }, []);

  // ✅ 상세 보기 닫기
  const handleCloseDetail = useCallback(() => {
    setSelectedComponent(null);
  }, []);

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div
        className="preview-modal"
        onClick={(e) => e.stopPropagation()} // 배경 클릭 시만 닫힘
      >
        {/* 닫기 버튼 */}
        <button className="preview-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* ✅ 상세 모드 / 목록 모드 전환 */}
        {!selectedComponent ? (
          <>
            <h3>{estimate.title || "견적 상세 보기"}</h3>
            <p className="preview-desc">{estimate.description}</p>

            {/* ✅ 5열 썸네일 */}
            <div className="preview-product-row">
              {components.length > 0 ? (
                components.map((p, i) => (
                  <div
                    key={i}
                    className="preview-item"
                    onClick={() => handleOpenDetail(p)}
                  >
                    <img
                      src={p.image || p.detail?.image || "/no-image.svg"}
                      alt={p.name}
                      className="preview-item-img"
                      onError={(e) => (e.target.src = "/no-image.svg")}
                    />
                    <p className="preview-item-name">{p.name}</p>
                  </div>
                ))
              ) : (
                <p className="empty-text">부품 정보가 없습니다.</p>
              )}
            </div>
          </>
        ) : (
          <div className="preview-detail-wrapper">
            <EstimateDetail
              estimate={selectedComponent}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
}
