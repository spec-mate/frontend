// src/pages/DetailPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useParams } from "react-router-dom";
import api from "../api"; // axios instance
import { useProgressStore } from "../store/progressStore"; // ✅ zustand progress store
import "../components/ProgressBar"; // ✅ ProgressBar 전역에서 App.jsx에 추가됨
import "./styles/ProductDetail.css";

export default function DetailPage() {
  const { productName } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const setProgress = useProgressStore((state) => state.setProgress);

  // ✅ 스크롤 이동할 대상 ref (페이지 상단)
  const topRef = useRef(null);

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
      setLoading(true);
      setProgress(30); // ✅ 시작할 때 progress 30%

      try {
        const res = await api.get(`/product/type/${apiType}`, {
          params: { page, size: 10 },
        });
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);

        setProgress(70); // ✅ 데이터 세팅 중간 단계
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err.response || err);
        setProducts([]);
      } finally {
        setTimeout(() => {
          setProgress(100); // ✅ 완료 시 100%
          setLoading(false);
        }, 300); // 살짝 딜레이 후 완료
      }
    };

    fetchProducts();
  }, [productName, page, apiType, setProgress]);

  // ✅ page가 바뀔 때마다 맨 위로 이동
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "auto" }); // 바로 이동
    }
  }, [page]);

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
        <div></div>

        <div className="main-inner" ref={topRef}>
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
              {products.length > 0
                ? products.map((p) => (
                    <Link
                      to={`/product/${productName}/${p.id}`}
                      className={`product-item ${loading ? "blurred" : ""}`}
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
                : !loading && <p>상품이 없습니다.</p>}
            </div>

            {/* ✅ 로딩 스피너 */}
            {loading && (
              <div className="loader-overlay">
                <div className="loader"></div>
              </div>
            )}

            {/* 페이지네이션 */}
            {!loading && (
              <div className="pagination">
                {/* ✅ 첫 번째 구간(0~9페이지)에서는 < 버튼 숨김 */}
                {page >= 10 && (
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
                    length: Math.min(
                      10,
                      totalPages - Math.floor(page / 10) * 10
                    ),
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
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
