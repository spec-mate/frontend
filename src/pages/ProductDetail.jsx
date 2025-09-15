import React from "react";
import { NavLink, Link, useParams } from "react-router-dom";
import "./styles/ProductDetail.css";

export default function DetailPage() {
  const { productName } = useParams();

  // 제목 매핑
  const titleMap = {
    mainboard: "메인보드",
    cpu: "CPU",
    gpu: "그래픽카드",
    ram: "메모리",
    ssd: "SSD",
    hdd: "HDD",
    cooler: "쿨러",
    power: "파워",
    case: "케이스",
  };
  const pageTitle = titleMap[productName] || "상품 목록";

  // 샘플 데이터
  const productTemplate = {
    id: 1,
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

  const products = Array.from({ length: 10 }, (_, i) => ({
    ...productTemplate,
    id: i + 1,
  }));

  return (
    <div className="detail-page">
      {/* 사이드바 */}
      <aside className="sidebar">
        <h3>부품종류</h3>
        <ul>
          {Object.entries(titleMap).map(([key, label]) => (
            <li key={key}>
              <NavLink
                to={`/product/${key}`}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* 본문 */}
      <div className="main-content">
        <h2>{pageTitle}</h2>

        {/* 필터 + 검색 */}
        <div className="filter-bar">
          <div className="filter-table">
            {/* 제조사 */}
            <div className="row">
              <div className="label">제조사</div>
              <div className="options">
                <label>
                  <input type="checkbox" /> AMD
                </label>
                <label>
                  <input type="checkbox" /> 인텔
                </label>
              </div>
            </div>

            {/* 가격 */}
            <div className="row">
              <div className="label">가격</div>
              <div className="options">
                <label>
                  <input type="checkbox" name="price" /> 낮은 가격순
                </label>
                <label>
                  <input type="checkbox" name="price" /> 높은 가격순
                </label>
              </div>
            </div>
          </div>

          {/* 검색창 */}
          <div className="search-box">
            <input type="text" placeholder="검색어를 입력하세요" />
            <button className="search-btn">
              <img src="/search-normal.svg" alt="검색" />
            </button>
          </div>
        </div>

        {/* 상품 리스트 */}
        <section className="detail-content">
          <div className="product-list">
            {products.map((p) => (
              <Link
                to={`/product/${productName}/${p.id}`}
                className="product-item"
                key={p.id}
              >
                <img src={p.img} alt={p.name} />
                <div className="info">
                  <h4>{p.name}</h4>
                  {p.specs.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
                <div className="price">
                  <span>최저가</span>
                  <strong>{p.price}</strong>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="pagination">
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
          </div>
        </section>
      </div>
    </div>
  );
}
