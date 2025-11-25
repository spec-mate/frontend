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
  const [selectedSort, setSelectedSort] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const setProgress = useProgressStore((state) => state.setProgress);
  const topRef = useRef(null);

  const titleMap = {
    mainboard: "메인보드",
    cpu: "CPU",
    gpu: "그래픽카드(VGA)",
    ram: "메모리(RAM)",
    cpucooler: "CPU쿨러",
    ssd: "SSD",
    hdd: "HDD",
    power: "파워",
    case: "케이스",
    casecooler: "케이스쿨러",
  };

  const pageTitle = titleMap[productName] || "상품 목록";

  const apiTypeMap = {
    mainboard: "mainboard",
    cpu: "cpu",
    gpu: "gpu",
    ram: "ram",
    ssd: "ssd",
    hdd: "hdd",
    cpucooler: "cpucooler",
    power: "power",
    case: "case",
    casecooler: "casecooler",
  };

  const apiType = apiTypeMap[productName] || productName;

  useEffect(() => {
    setPage(0);
    setSelectedManufacturer("");
    setSelectedSort("");
    setSearchQuery("");
  }, [productName]);

  // 제조사 목록 가져오기
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const res = await api.get(`/product/category/${apiType}`, {
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

  // 상품 목록 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProgress(30);

      try {
        const res = await api.get(`/product/category/${apiType}`, {
          params: {
            page,
            size: 10,
            manufacturer: selectedManufacturer || null,
          },
        });

        let items = res.data.content || [];

        if (searchQuery.trim()) {
          items = items.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (selectedSort === "asc") {
          items.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (selectedSort === "desc") {
          items.sort((a, b) => (b.price || 0) - (a.price || 0));
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
  }, [
    apiType,
    page,
    selectedManufacturer,
    selectedSort,
    searchQuery,
    setProgress,
  ]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "auto" });
  }, [page]);

  // ===============================
  // 🔥 스펙 3개 preview (product.specs 사용)
  // ===============================
  const renderSpecsPreview = (specs) => {
    if (!Array.isArray(specs) || specs.length === 0) return null;

    return <div className="spec-preview">{specs.slice(0, 3).join(" / ")}</div>;
  };

  const pageGroup = Math.floor(page / 10);
  const startPage = pageGroup * 10;
  const endPage = Math.min(startPage + 10, totalPages);

  return (
    <div className="detail-page">
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

      <div className="main-content">
        <div className="main-inner" ref={topRef}>
          <div className="breadcrumb">
            <Link to="/info" className="breadcrumb-link">
              PC 부품 정보
            </Link>
            &gt; <span>{pageTitle}</span>
          </div>

          <h2>{pageTitle}</h2>

          {/* FILTER */}
          <div className="filter-bar">
            <div className="filter-table">
              <div className="row">
                <div className="label manufacturer-label">제조사</div>
                <div className="options">
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
                </div>
              </div>

              <div className="row">
                <div className="label price-label">가격 정렬</div>
                <div className="options">
                  <label>
                    <input
                      type="radio"
                      name="sort"
                      value="asc"
                      checked={selectedSort === "asc"}
                      onChange={() => setSelectedSort("asc")}
                    />
                    낮은순
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="sort"
                      value="desc"
                      checked={selectedSort === "desc"}
                      onChange={() => setSelectedSort("desc")}
                    />
                    높은순
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="sort"
                      value=""
                      checked={selectedSort === ""}
                      onChange={() => setSelectedSort("")}
                    />
                    기본
                  </label>
                </div>
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="상품명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">
                <img src="/search.svg" alt="검색" />
              </button>
            </div>
          </div>

          {/* PRODUCT LIST */}
          <section className="detail-content">
            <div className={`product-list ${loading ? "loading" : ""}`}>
              {products.length > 0
                ? products.map((p) => (
                    <Link
                      to={`/product/${productName}/${p.id}`}
                      className="product-item"
                      key={p.id}
                    >
                      <img
                        src={
                          p.image
                            ? p.image
                            : p.transparentImage || "/no-image.svg"
                        }
                        alt={p.name}
                      />

                      <div className="info">
                        <h4 className="product-title">{p.name}</h4>

                        {/* 🔥 여기 product.specs 3개 출력 */}
                        {renderSpecsPreview(p.specs)}
                      </div>

                      <div className="price">
                        <span>최저가</span>
                        {p.price ? (
                          <div>
                            <strong className="price-number">
                              {Number(p.price).toLocaleString()}
                            </strong>
                            <span className="price-unit">원</span>
                          </div>
                        ) : (
                          <strong className="price-number">정보 없음</strong>
                        )}
                      </div>
                    </Link>
                  ))
                : !loading && <p>상품이 없습니다.</p>}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                {pageGroup > 0 && (
                  <button
                    className="arrow-btn"
                    onClick={() => setPage(startPage - 1)}
                  >
                    <img
                      src="/arrow-right.svg"
                      alt="이전"
                      className="arrow-icon left"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </button>
                )}

                {Array.from({ length: endPage - startPage }, (_, i) => (
                  <button
                    key={startPage + i}
                    className={`page-btn ${page === startPage + i ? "active" : ""}`}
                    onClick={() => setPage(startPage + i)}
                  >
                    {startPage + i + 1}
                  </button>
                ))}

                {endPage < totalPages && (
                  <button
                    className="arrow-btn"
                    onClick={() => setPage(endPage)}
                  >
                    <img
                      src="/arrow-right.svg"
                      alt="다음"
                      className="arrow-icon"
                    />
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
