import React, { useEffect, useState } from "react";
import { NavLink, Link, useParams } from "react-router-dom";
import api from "../api"; // axios instance
import "./styles/ProductDetail.css";

export default function DetailPage() {
  const { productName } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  const apiTypeMap = {
    mainboard: "mainboard",
    cpu: "cpu",
    gpu: "vga",
    ram: "ram",
    ssd: "ssd",
    hdd: "hdd",
    cooler: "cooler",
    power: "power",
    case: "case",
  };
  const apiType = apiTypeMap[productName] || productName;

  // 상품 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/product/type/${apiType}`, {
          params: { page, size: 10 },
        });
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err.response || err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [productName, page]);

  return (
    <div className="detail-page">
      {/* 왼쪽 열 */}
      <div className="left-column">
        <div></div>
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
      </div>

      {/* 메인 콘텐츠 */}
      <div className="main-content">
        {/* 72px 비어있는 첫 행 */}
        <div></div>

        {/* 실제 콘텐츠 */}
        <div className="main-inner">
          <h2>{pageTitle}</h2>

          {/* 필터 + 검색 */}
          <div className="filter-bar">
            <div className="filter-table">
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
              {products.length > 0 ? (
                products.map((p) => (
                  <Link
                    to={`/product/${productName}/${p.id}`}
                    className="product-item"
                    key={p.id}
                  >
                    <img src={p.image || "/no-image.svg"} alt={p.name} />
                    <div className="info">
                      <h4>{p.name}</h4>
                      <p>{p.manufacturer}</p>
                    </div>
                    <div className="price">
                      <span>최저가</span>
                      <strong>
                        {p.lowestPrice?.price
                          ? `₩${p.lowestPrice.price.toLocaleString()}`
                          : "정보 없음"}
                      </strong>
                    </div>
                  </Link>
                ))
              ) : (
                <p>상품이 없습니다.</p>
              )}
            </div>

            {/* 페이지네이션 */}
            <div className="pagination">
              {/* ◀ 이전 블록 */}
              {page > 0 && (
                <button
                  onClick={() => {
                    const startPage = Math.floor(page / 10) * 10;
                    setPage(Math.max(startPage - 10, 0));
                  }}
                >
                  &lt;
                </button>
              )}

              {Array.from(
                {
                  length: Math.min(10, totalPages - Math.floor(page / 10) * 10),
                },
                (_, i) => {
                  const startPage = Math.floor(page / 10) * 10;
                  const pageNumber = startPage + i;
                  return (
                    pageNumber < totalPages && (
                      <button
                        key={pageNumber}
                        className={pageNumber === page ? "active" : ""}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber + 1}
                      </button>
                    )
                  );
                }
              )}

              {/* ▶ 다음 블록 */}
              {page < totalPages - 1 && (
                <button
                  onClick={() => {
                    const startPage = Math.floor(page / 10) * 10;
                    setPage(Math.min(startPage + 10, totalPages - 1));
                  }}
                >
                  &gt;
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
