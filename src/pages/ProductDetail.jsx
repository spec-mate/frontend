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
    storage: "스토리지",
    cooler: "쿨러",
    power: "파워",
    case: "케이스",
  };

  const pageTitle = titleMap[productName] || "상품 목록";

  const apiTypeMap = {
    mainboard: "mainboard",
    cpu: "cpu",
    gpu: "gpu",
    ram: "ram",
    storage: "storage",
    cpucooler: "cpucooler",
    cooler: "cooler",
    power: "power",
    case: "case",
    casefan: "casefan",
  };

  const apiType = apiTypeMap[productName] || productName;

  // 카테고리 변경 시 필터 초기화
  useEffect(() => {
    setPage(0);
    setSelectedManufacturer("");
    setSelectedSort("");
    setSearchQuery("");
  }, [productName]);

  // 🔥 제조사 목록 추출
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

  // 🔥 상품 목록 가져오기
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
        console.log("📦 API 응답 데이터:", res.data);
        let items = res.data.content || [];

        // 검색
        if (searchQuery.trim()) {
          items = items.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        // 정렬
        if (selectedSort === "asc") {
          items.sort((a, b) => (a.priceKrw || 0) - (b.priceKrw || 0));
        } else if (selectedSort === "desc") {
          items.sort((a, b) => (b.priceKrw || 0) - (a.priceKrw || 0));
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

  // ==========================================================
  // 🔥 자동 스펙 요약 생성 (상세페이지 라벨 기반)
  // ==========================================================

  const optionLabels = {
    series: "시리즈",
    variant: "모델",
    cores_total: "코어",
    threads: "스레드",
    base_clock_ghz: "기본 클럭",
    boost_clock_ghz: "부스트 클럭",
    tdp_watt: "TDP",
    chipset: "칩셋",
    memory_gb: "메모리",
    memory_type: "메모리 타입",
    speed_mhz: "속도",
    ram_type: "RAM 타입",
    capacity_gb: "용량",
    form_factor: "폼팩터",
    interface: "인터페이스",
    wattage_w: "출력(W)",
    efficiency_rating: "효율",
    modular: "모듈러",
    fan_size_mm: "팬 크기",
    height_mm: "높이",
    max_tdp_w: "지원 TDP",
    max_gpu_length_mm: "GPU 길이",
    max_cpu_cooler_height_mm: "CPU 쿨러 높이",
    socket: "소켓",
    architecture: "아키텍처",
    length_mm: "길이",
  };

  const listSpecPriority = {
    cpu: ["cores_total", "base_clock_ghz", "tdp_watt"],
    gpu: ["chipset", "memory_gb", "tdp_w"],
    ram: ["capacity_gb", "speed_mhz", "ram_type"],
    storage: ["capacity_gb", "interface", "type"],
    power: ["wattage_w", "efficiency_rating", "modular"],
    cooler: ["fan_size_mm", "height_mm", "max_tdp_w"],
    case: ["form_factor", "max_gpu_length_mm", "max_cpu_cooler_height_mm"],
    mainboard: ["chipset", "socket", "form_factor"],
  };

  const formatValue = (v) => {
    if (v === true) return "O";
    if (v === false) return "X";
    return Array.isArray(v) ? v.join(", ") : v;
  };

  const renderSpecs = (type, detail) => {
    if (!detail) return null;

    const keys = listSpecPriority[type] || [];
    const selected = keys
      .map((key) => ({
        key,
        value: detail[key],
        label: optionLabels[key] || key,
      }))
      .filter((item) => item.value !== undefined && item.value !== null)
      .slice(0, 3);

    if (selected.length === 0) return <div className="specs"></div>;

    return (
      <div className="specs">
        {selected.map((item) => (
          <p key={item.key}>
            {item.label}: {formatValue(item.value)}
          </p>
        ))}
      </div>
    );
  };

  // ==========================================================

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

          {/* ------- FILTER ------- */}
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

          {/* ------- PRODUCT LIST ------- */}
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
                        {renderSpecs(productName, p.detail)}
                      </div>

                      <div className="price">
                        <span>최저가</span>
                        {p.priceKrw ? (
                          <div>
                            <strong className="price-number">
                              {Number(p.priceKrw).toLocaleString()}
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

            {/* ------- PAGINATION ------- */}
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
                    className={`page-btn ${
                      page === startPage + i ? "active" : ""
                    }`}
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
