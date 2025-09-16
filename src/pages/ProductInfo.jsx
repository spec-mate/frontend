import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useHeaderStore } from "../store/headerStore";
import "./styles/ProductInfo.css";

export default function ProductInfo() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  // ✅ products 배열 그대로 안에 넣음
  const products = [
    {
      title: "메인보드",
      img: "/mainboard.svg",
      path: "/product/mainboard",
      description:
        "컴퓨터안에 있는 전자판, 부품들이 정보를 주고받을 수 있도록 길을 만들어 주는 역할 수행",
    },
    {
      title: "CPU",
      img: "/cpu.svg",
      path: "/product/cpu",
      description: "컴퓨터의 두뇌, 계산을 처리하고 명령하는 핵심 부품",
    },
    {
      title: (
        <h3>
          <span className="line-break">그래픽카드</span>
          <span className="line-break">VGA</span>
        </h3>
      ),
      img: "/gpu.svg",
      path: "/product/GPU",
      description:
        "컴퓨터가 화면에 그림, 영상, 게임 그래픽 등을 빠르고 선명하게 보여주도록 도와주는 부품",
    },
    {
      title: (
        <h3>
          <span className="line-break">메모리</span>
          <span className="line-break">RAM</span>
        </h3>
      ),
      img: "/ram.svg",
      path: "/product/RAM",
      description:
        "컴퓨터가 작업할 때 필요한 내용을 잠시 저장해 두는 빠른 임시 저장공간",
    },
    {
      title: "SSD",
      img: "/ssd.svg",
      path: "/product/ssd",
      description:
        "컴퓨터에 프로그램과 파일을 설치하고, 빠르게 불러올 수 있게 해주는 저장장치",
    },
    {
      title: "HDD",
      img: "/hdd.svg",
      path: "/product/hdd",
      description:
        "자석이 달린 원판(디스크)에 데이터를 기록해두는 전통적인 기록장치",
    },
    {
      title: "쿨러",
      img: "/cooler.svg",
      path: "/product/cooler",
      description: "CPU나 그래픽카드처럼 뜨거워지는 부품의 열을 식혀주는 장치",
    },
    {
      title: "파워",
      img: "/power.svg",
      path: "/product/power",
      description:
        "전기콘센트에서 들어오는 전기를 컴퓨터 부품이 쓸 수 있게 바꿔서 공급하는 장치",
    },
    {
      title: "케이스",
      img: "/case.svg",
      path: "/product/case",
      description:
        "메인보드, CPU, 그래픽카드, 파워같은 모든 부품을 담고 보호하는 컴퓨터의 뼈대",
    },
  ];

  return (
    <div className="product-page">
      <h2 className="product-title">PC 부품 정보</h2>
      <p className="product-subtitle">
        스펙메이트는 수많은 부품들의 정보를 제공합니다!
      </p>

      <div className="product-grid">
        {products.map((p, i) => (
          <Link to={p.path} key={i} className="product-card">
            <img
              src={p.img}
              alt={typeof p.title === "string" ? p.title : "부품"}
            />
            <div className="overlay">
              {typeof p.title === "string" ? <h3>{p.title}</h3> : p.title}
              <p>{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
