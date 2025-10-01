import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useParams } from "react-router-dom";
import api from "../api";
import { useProgressStore } from "../store/progressStore";
import "../components/ProgressBar";
import "./styles/ProductDetail.css";

export default function DetailPage() {
  const { productName } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedSort, setSelectedSort] = useState(""); // ✅ 정렬 상태 추가

  const setProgress = useProgressStore((state) => state.setProgress);
  const topRef = useRef(null);

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
    ram: "RAM",
    ssd: "ssd",
    hdd: "hdd",
    cooler: "cooler",
    power: "power",
    case: "case",
  };
  const apiType = apiTypeMap[productName] || productName;

  // ✅ productName 변경 시 초기화
  useEffect(() => {
    setPage(0);
    setSelectedManufacturer("");
    setSelectedSort("");
  }, [productName]);

  // ✅ 제조사 목록 가져오기
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const res = await api.get(`/product/type/${apiType}`, {
          params: { page: 0, size: 1000 },
        });
        const items = res.data.content || [];
        const manuList = [
          ...new Set(items.map((p) => p.manufacturer).filter(Boolean)),
        ];
        setManufacturers(manuList);
      } catch (err) {
        console.error("제조사 목록 가져오기 실패:", err.response || err);
      }
    };
    fetchManufacturers();
  }, [apiType]);

  // ✅ 상품 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProgress(30);

      try {
        const res = await api.get(`/product/type/${apiType}`, {
          params: {
            page,
            size: 20,
            manufacturer: selectedManufacturer || null,
          },
        });
        let items = res.data.content || [];

        // ✅ 프론트에서 가격 정렬 적용
        if (selectedSort === "asc") {
          items.sort((a, b) => {
            const priceA = parseInt(
              a.lowestPrice?.price ?? Number.MAX_SAFE_INTEGER,
              10
            );
            const priceB = parseInt(
              b.lowestPrice?.price ?? Number.MAX_SAFE_INTEGER,
              10
            );
            return priceA - priceB;
          });
        } else if (selectedSort === "desc") {
          items.sort((a, b) => {
            const priceA = parseInt(a.lowestPrice?.price ?? 0, 10);
            const priceB = parseInt(b.lowestPrice?.price ?? 0, 10);
            return priceB - priceA;
          });
        }

        setProducts(items);
        setTotalPages(res.data.totalPages || 1);

        setProgress(70);
      } catch (err) {
        console.error("상품 불러오기 실패:", err.response || err);
        setProducts([]);
      } finally {
        setTimeout(() => {
          setProgress(100);
          setLoading(false);
        }, 300);
      }
    };

    fetchProducts();
  }, [apiType, page, selectedManufacturer, selectedSort, setProgress]);

  // ✅ 페이지 변경 시 스크롤 맨 위로
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [page]);

  return (
    <div className="detail-page">
      {/* 왼쪽 열 */}
      <div className="left-column">
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
        <div className="main-inner" ref={topRef}>
          <div className="breadcrumb">
            <Link to="/info" className="breadcrumb-link">
              PC 부품 정보
            </Link>
            &gt; <span>{pageTitle}</span>
          </div>

          <h2>{pageTitle}</h2>

          {/* 필터 + 검색 */}
          <div className="filter-bar">
            <div className="filter-table">
              {/* 제조사 */}
              <div className="row">
                <div className="label manufacturer-label">제조사 선택</div>
                <div className="options">
                  <label>
                    <input
                      type="radio"
                      name="manufacturer"
                      value=""
                      checked={selectedManufacturer === ""}
                      onChange={() => setSelectedManufacturer("")}
                    />
                    전체
                  </label>
                  {manufacturers.map((m) => (
                    <label key={m}>
                      <input
                        type="radio"
                        name="manufacturer"
                        value={m}
                        checked={selectedManufacturer === m}
                        onChange={() => setSelectedManufacturer(m)}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              {/* 가격 정렬 */}
              <div className="row">
                <div className="label price-label">가격 정렬</div>
                <div className="options">
                  <label>
                    <input
                      type="radio"
                      name="priceSort"
                      value="asc"
                      checked={selectedSort === "asc"}
                      onChange={() => setSelectedSort("asc")}
                    />
                    낮은 가격순
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="priceSort"
                      value="desc"
                      checked={selectedSort === "desc"}
                      onChange={() => setSelectedSort("desc")}
                    />
                    높은 가격순
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="priceSort"
                      value=""
                      checked={selectedSort === ""}
                      onChange={() => setSelectedSort("")}
                    />
                    인기순
                  </label>
                </div>
              </div>
            </div>

            {/* 검색 */}
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

            {/* 페이지네이션 */}
            {!loading && (
              <div className="pagination">
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
