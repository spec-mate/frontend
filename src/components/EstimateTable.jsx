import React from "react";
import "./EstimateTable.css"; // CSS 파일 임포트

// 가격 포맷팅 함수
const formatPrice = (price) => {
  if (!price) return "0";
  const numericPrice = Number(String(price).replace(/[^0-9]/g, ""));
  return numericPrice.toLocaleString();
};

const productTypeMap = {
  cpu: "CPU",
  vga: "그래픽카드",
  RAM: "메모리",
  ssd: "SSD",
  power: "파워서플라이",
  mainboard: "메인보드",
  cooler: "CPU 쿨러",
  case: "케이스",
  hdd: "HDD",
};

export default function EstimateTable({ estimate }) {
  // ▼▼▼ 수정된 부분 1: 'products' -> 'components'로 변경 ▼▼▼
  if (!estimate || !estimate.components) {
    return <p>견적 정보를 불러올 수 없습니다.</p>;
  }

  return (
    <div className="estimate-table-container">
      <div className="et-header">
        {/* ▼▼▼ 수정된 부분 2: key 이름 변경 (build_name, build_description) ▼▼▼ */}
        <h4 className="et-title">{estimate.build_name || "AI 추천 견적"}</h4>
        {estimate.build_description && (
          <p className="et-desc">{estimate.build_description}</p>
        )}
      </div>
      <table className="et-table">
        <thead>
          <tr>
            <th>부품</th>
            <th>제품명</th>
            <th style={{ textAlign: "right" }}>가격</th>
          </tr>
        </thead>
        <tbody>
          {/* ▼▼▼ 수정된 부분 3: 'components' 배열을 map으로 순회 ▼▼▼ */}
          {estimate.components.map((product, index) => (
            <tr key={index}>
              <td>{productTypeMap[product.type] || product.type}</td>
              <td>{product.name}</td>
              <td style={{ textAlign: "right" }}>
                {formatPrice(product.detail?.price)}원
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="et-footer">
        <span className="et-total-label">총 견적 금액</span>
        {/* ▼▼▼ 수정된 부분 4: key 이름 변경 (total) ▼▼▼ */}
        <span className="et-total-price">{formatPrice(estimate.total)}원</span>
      </div>
      {estimate.notes && <p className="et-notes">{estimate.notes}</p>}
    </div>
  );
}
