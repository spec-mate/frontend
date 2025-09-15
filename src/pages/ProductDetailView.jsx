import React from "react";
import { useParams } from "react-router-dom";

export default function ProductDetailView() {
  const { productName, id } = useParams();

  // 실제로는 API 호출 필요
  const dummyProduct = {
    id,
    name: "AMD 라이젠7-6세대 9800X3D (그래니트 릿지)",
    img: "/cpu.svg",
    price: "₩630,830",
    specs: [
      "AMD(소켓AM5) / 8코어 / 16스레드 / DDR5 / 내장그래픽 O",
      "기본 클럭: 4.7GHz / 최대 클럭: 5.2GHz",
      "L2 캐시: 8MB / L3 캐시: 96MB",
      "TDP: 120W / PCIe 5.0 / 5600MHz",
    ],
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>{productName.toUpperCase()} 상세보기</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <img src={dummyProduct.img} alt={dummyProduct.name} width="200" />
        <div>
          <h3>{dummyProduct.name}</h3>
          <p>
            <strong>가격:</strong> {dummyProduct.price}
          </p>
          <ul>
            {dummyProduct.specs.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
