import React, { useEffect, useState } from "react";
import api from "../api/index.js";
import "./EstimateSelectModal.css";

export default function EstimateSelectModal({ product, onClose, onSuccess }) {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  // ✅ 견적 목록 불러오기 (MyPage 방식)
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.warn("⚠️ accessToken 없음 — 로그인 필요");
          onSuccess("로그인이 필요합니다.", "error");
          window.location.href = "/login";
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const res = await api.get("/estimate/me", { headers });

        console.log("📦 견적 목록 응답:", res.data);

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];

        setEstimates(data);
      } catch (err) {
        console.error("견적 목록 불러오기 실패:", err);
        setError("견적 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchEstimates();
  }, []);

  // ✅ 기존 견적에 상품 추가 (요청 본문 수정)
  const handleAddToEstimate = async (estimateId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        productId: product.id,
        category: product.type || product.category || "unknown",
        quantity: 1,
      };

      console.log("🛠️ 추가 요청 본문:", payload);

      await api.post(`/estimate/${estimateId}/products`, payload, { headers });

      onSuccess("견적에 상품이 추가되었습니다.");
    } catch (err) {
      console.error("견적 추가 실패:", err);
      onSuccess("견적 추가에 실패했습니다.", "error");
    }
  };

  // ✅ 새 견적 생성 + 상품 추가
  const handleCreateNewEstimate = async () => {
    if (!newTitle.trim()) {
      onSuccess("견적 제목을 입력해주세요.", "error");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.post(
        "/estimate",
        {
          title: newTitle,
          description: `${product.name} 포함 견적`,
        },
        { headers },
      );

      const newId = res.data.id;
      console.log("🆕 새 견적 생성:", newId);

      // 새 견적 생성 후 상품 추가
      await handleAddToEstimate(newId);
      setNewTitle("");
    } catch (err) {
      console.error("새 견적 생성 실패:", err);
      onSuccess("새 견적 생성 실패", "error");
    } finally {
      setCreating(false);
    }
  };

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
            {estimates.length > 0 ? (
              <ul className="estimate-list">
                {estimates.map((e) => (
                  <li key={e.id} className="estimate-item">
                    <div>
                      <strong>{e.title}</strong>
                      <p>{e.description}</p>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => handleAddToEstimate(e.id)}
                    >
                      추가
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-box">
                <p>저장된 견적이 없습니다.</p>
              </div>
            )}

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
    </div>
  );
}
