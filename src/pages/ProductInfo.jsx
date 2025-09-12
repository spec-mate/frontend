import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useHeaderStore } from "../store/headerStore";
import "./styles/ProductInfo.css";

const products = [
  {
    title: "메인보드",
    subtitle: "Mainboard",
    img: "/mainboard.svg",
    path: "/product/mainboard",
  },
  {
    title: "CPU",
    subtitle: "CPU",
    img: "/cpu.svg",
    path: "/product/cpu",
  },
  {
    title: "그래픽카드",
    subtitle: "VGA",
    img: "/gpu.svg",
    path: "/product/gpu",
  },
  {
    title: "메모리",
    subtitle: "RAM",
    img: "/ram.svg",
    path: "/product/ram",
  },
  {
    title: "SSD",
    subtitle: "SSD",
    img: "/ssd.svg",
    path: "/product/ssd",
  },
  {
    title: "HDD",
    subtitle: "HDD",
    img: "/hdd.svg",
    path: "/product/hdd",
  },
  {
    title: "쿨러",
    subtitle: "Cooler",
    img: "/cooler.svg",
    path: "/product/cooler",
  },
  {
    title: "파워",
    subtitle: "Power",
    img: "/power.svg",
    path: "/product/power",
  },
  {
    title: "케이스",
    subtitle: "Case",
    img: "/case.svg",
    path: "/product/case",
  },
];

export default function ProductInfo() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black"); // ✅ 페이지 들어올 때 헤더 검정색으로
  }, [setHeaderVersion]);

  return (
    <div className="product-page">
      <h2 className="product-title">PC 부품 정보</h2>
      <p className="product-subtitle">
        스펙메이트는 수많은 부품들의 정보를 제공합니다!
      </p>

      <div className="product-grid">
        {products.map((p, i) => (
          <Link to={p.path} key={i} className="product-card">
            <img src={p.img} alt={p.title} />
            <div className="overlay">
              <h3>{p.title}</h3>
              <span>{p.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
