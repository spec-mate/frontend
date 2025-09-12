import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useHeaderStore } from "../store/headerStore";
import "./styles/ProductDetail.css";

const mockProducts = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: "AMD 라이젠7-5세대 8900X3D (그레이프 폭포)",
  img: "/cpu.svg",
  specs:
    "8코어 16스레드 / 기본 4.7GHz / 최대 5.6GHz / L3 128MB / TDP 120W / DDR5 / PCIe 5.0",
  price: 630830,
}));

export default function ProductDetail() {
  const { id } = useParams();
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  return (
    <div className="detail-page">
      <aside className="sidebar">
        <h3>부품 종류</h3>
        <ul>
          <li className={id === "mainboard" ? "active" : ""}>
            <Link to="/product/mainboard">메인보드</Link>
          </li>
          <li className={id === "cpu" ? "active" : ""}>
            <Link to="/product/cpu">CPU</Link>
          </li>
          <li className={id === "gpu" ? "active" : ""}>
            <Link to="/product/gpu">그래픽카드(VGA)</Link>
          </li>
          <li className={id === "ram" ? "active" : ""}>
            <Link to="/product/ram">메모리(RAM)</Link>
          </li>
          <li className={id === "ssd" ? "active" : ""}>
            <Link to="/product/ssd">SSD</Link>
          </li>
          <li className={id === "hdd" ? "active" : ""}>
            <Link to="/product/hdd">HDD</Link>
          </li>
          <li className={id === "cooler" ? "active" : ""}>
            <Link to="/product/cooler">쿨러</Link>
          </li>
          <li className={id === "power" ? "active" : ""}>
            <Link to="/product/power">파워</Link>
          </li>
          <li className={id === "case" ? "active" : ""}>
            <Link to="/product/case">케이스</Link>
          </li>
        </ul>
      </aside>

      <main className="detail-content">
        <h2>{id.toUpperCase()}</h2>

        <div className="filter-table">
          <div className="row">
            <div className="label">제조사</div>
            <div className="options">
              <label>
                <input type="radio" name="maker" value="amd" /> AMD
              </label>
              <label>
                <input type="radio" name="maker" value="intel" /> 인텔
              </label>
            </div>
          </div>
          <div className="row">
            <div className="label">가격</div>
            <div className="options">
              <label>
                <input type="radio" name="price" value="low" /> 낮은 가격 순
              </label>
              <label>
                <input type="radio" name="price" value="high" /> 높은 가격 순
              </label>
            </div>
          </div>
        </div>

        <div className="product-list">
          {mockProducts.map((p) => (
            <div className="product-item" key={p.id}>
              <img src={p.img} alt={p.name} />
              <div className="info">
                <h4>{p.name}</h4>
                <p>{p.specs}</p>
              </div>
              <div className="price">
                <span>최저가</span>
                <strong>{p.price.toLocaleString()}원</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button>&lt;</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>&gt;</button>
        </div>
      </main>
    </div>
  );
}
