import React from "react";
import "./styles/ProductInfo.css";

const products = [
  { title: "메인보드", subtitle: "Mainboard", img: "./mainboard.svg" },
  { title: "CPU", subtitle: "CPU", img: "./cpu.svg" },
  { title: "그래픽카드", subtitle: "VGA", img: "./gpu.svg" },
  { title: "메모리", subtitle: "RAM", img: "./ram.svg" },
  { title: "SSD", subtitle: "SSD", img: "./ssd.svg" },
  { title: "HDD", subtitle: "HDD", img: "./hdd.svg" },
  { title: "쿨러", subtitle: "Cooler", img: "./cooler.svg" },
  { title: "파워", subtitle: "Power", img: "./power.svg" },
  { title: "케이스", subtitle: "Case", img: "./case.svg" },
];

export default function ProductInfo() {
  return (
    <div className="product-page">
      <h2 className="product-title">PC 부품 정보</h2>
      <p className="product-subtitle">
        스펙메이트는 수많은 부품들의 정보를 제공합니다!
      </p>

      <div className="product-grid">
        {products.map((p, i) => (
          <div className="product-card" key={i}>
            <img src={p.img} alt={p.title} />
            <div className="overlay">
              <h3>{p.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
