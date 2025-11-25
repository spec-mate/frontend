import React, { useEffect, useState, useCallback } from "react";
import api from "../api";
import "./EstimateSelectModal.css";
import EstimatePreviewModal from "./EstimatePreviewModal";

export default function EstimateSelectModal({ product, onClose, onSuccess }) {
  const [userEstimates, setUserEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  // ✅ 유저 견적 목록 불러오기
  useEffect(() => {
    const fetchUserEstimates = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          onSuccess("로그인이 필요합니다.", "error");
          window.location.href = "/login";
          return;
        }

        const res = await api.get("/estimate/me");
        const userData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];
        setUserEstimates(userData);
      } catch (err) {
        console.error("❌ 견적 불러오기 실패:", err);
        setError("견적 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEstimates();
  }, [onSuccess]);

  // ✅ 견적에 상품 추가
  const handleAddToEstimate = useCallback(
    async (estimateId) => {
      try {
        const payload = {
          productId: product.id,
          category: product.type || product.category || "unknown",
          quantity: 1,
        };
        await api.post(`/estimate/${estimateId}/products`, payload);
        onSuccess("견적에 상품이 추가되었습니다.");
      } catch (err) {
        console.error("❌ 견적 추가 실패:", err);
        onSuccess("견적 추가에 실패했습니다.", "error");
      }
    },
    [product, onSuccess],
  );

  // ✅ 새 견적 생성 + 상품 추가
  const handleCreateNewEstimate = useCallback(async () => {
    if (!newTitle.trim()) {
      onSuccess("견적 제목을 입력해주세요.", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/estimate", {
        title: newTitle,
        description: `${product.name} 포함 견적`,
      });
      const newId = res.data.id;
      await handleAddToEstimate(newId);
      setNewTitle("");
    } catch (err) {
      console.error("❌ 새 견적 생성 실패:", err);
      onSuccess("새 견적 생성 실패", "error");
    } finally {
      setCreating(false);
    }
  }, [newTitle, product, handleAddToEstimate, onSuccess]);

  const handlePreview = async (estimateId) => {
    try {
      const res = await api.get(`/estimate/${estimateId}`);
      const data = res.data?.data || res.data;
      setSelectedEstimate(data);
    } catch (err) {
      console.error("❌ 견적 상세 불러오기 실패:", err);
    }
  };

  const getImage = (estimate) => estimate.products?.[0]?.image || "/gaming.svg";

  return (
    <div className="estimate-modal-overlay">
      <div className="estimate-modal">
        <h3>견적 선택</h3>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <p>불러오는 중...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            {userEstimates.length > 0 ? (
              <div className="estimate-modal-grid">
                {userEstimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="estimate-modal-card"
                    onClick={() => handlePreview(estimate.id)}
                  >
                    <img
                      src={getImage(estimate)}
                      alt={estimate.title || "견적"}
                      className="estimate-modal-thumb"
                      onError={(e) => (e.target.src = "/no-image.svg")}
                    />

                    {estimate.products && estimate.products.length > 0 && (
                      <div className="estimate-modal-thumbnails">
                        {estimate.products.slice(0, 10).map((p, i) => (
                          <img
                            key={i}
                            src={p.image || "/no-image.svg"}
                            alt={p.name}
                            className="estimate-modal-thumb-item"
                            onError={(e) => (e.target.src = "/no-image.svg")}
                          />
                        ))}
                      </div>
                    )}

                    <div className="estimate-modal-info">
                      <p className="estimate-modal-title">
                        {estimate.title || "사용자 견적"}
                      </p>
                      <p className="estimate-modal-desc">
                        {estimate.description || "설명이 없습니다."}
                      </p>
                      <button
                        className="estimate-modal-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToEstimate(estimate.id);
                        }}
                      >
                        추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                <p>저장된 견적이 없습니다.</p>
              </div>
            )}

            {/* 새 견적 생성 */}
            <div className="new-estimate-box">
              <input
                type="text"
                placeholder="새 견적 제목 입력"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={creating}
              />
              <button
                className="new-btn"
                onClick={handleCreateNewEstimate}
                disabled={creating}
              >
                {creating ? "생성 중..." : "견적 생성"}
              </button>
            </div>
          </>
        )}
      </div>

      {selectedEstimate && (
        <EstimatePreviewModal
          estimate={selectedEstimate}
          onClose={() => setSelectedEstimate(null)}
        />
      )}
    </div>
  );
}
