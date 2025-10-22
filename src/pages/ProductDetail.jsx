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

  useEffect(() => {
    setPage(0);
    setSelectedManufacturer("");
    setSelectedSort("");
    setSearchQuery("");
  }, [productName]);

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProgress(30);

      try {
        const res = await api.get(`/product/type/${apiType}`, {
          params: {
            page,
            size: 10,
            manufacturer: selectedManufacturer || null,
          },
        });

        const getNumericPrice = (product) => {
          const priceStr = product.lowestPrice?.price || "0";
          return parseInt(String(priceStr).replace(/[^0-9]/g, ""), 10) || 0;
        };

        let items = res.data.content || [];

        if (searchQuery.trim()) {
          items = items.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        if (selectedSort === "asc") {
          items.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
        } else if (selectedSort === "desc") {
          items.sort((a, b) => getNumericPrice(b) - getNumericPrice(a));
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

  const formatValue = (val) => {
    if (typeof val === "boolean") return val ? "O" : "X";
    if (val === "true") return "O";
    if (val === "false") return "X";
    return val;
  };

  /** ✅ CPU는 유지, 나머지는 ProductDetailView 기반 핵심 5개 스펙 */
  const renderSpecs = (type, options) => {
    if (!options) return null;
    const o = options;
    let lines = [];

    switch (type) {
      /** ✅ CPU 그대로 유지 */
      case "cpu":
        lines = [
          [
            o.core && `${o.core}`,
            o.thread && `${o.thread}스레드`,
            o.memory_type,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.base_clock && `기본 ${o.base_clock}`,
            o.boost_clock && `최대 ${o.boost_clock}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [o.l3_cache && `L3 캐시 ${o.l3_cache}`, o.tdp && `TDP ${o.tdp}`]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ GPU */
      case "gpu":
      case "vga":
        lines = [
          [o.chipset_vendor, o.chipset].filter(Boolean).join(" / "),
          [o.memory_capacity && `${o.memory_capacity}`, o.memory_type]
            .filter(Boolean)
            .join(" / "),
          [o.boost_clock && `부스트 ${o.boost_clock}`, o.tdp && `TDP ${o.tdp}`]
            .filter(Boolean)
            .join(" / "),
          [
            o.length && `길이 ${o.length}`,
            o.power_connectors && `전원 ${o.power_connectors}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ 메인보드 */
      case "mainboard":
        lines = [
          [o.socket, o.chipset].filter(Boolean).join(" / "),
          [o.form_factor, o.memory_type].filter(Boolean).join(" / "),
          [
            o.m2_interface && `M.2 ${o.m2_interface}`,
            o.pcie_x16_slots && `PCIe x16 ${o.pcie_x16_slots}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.lan_speed && `LAN ${o.lan_speed}`,
            o.rgb && `RGB ${formatValue(o.rgb)}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ RAM */
      case "ram":
        lines = [
          [o.capacity, o.speed && `${o.speed}`].filter(Boolean).join(" / "),
          [o.memory_type, o.formfactor].filter(Boolean).join(" / "),
          [
            o.voltage && `전압 ${o.voltage}`,
            o.heatsink && `방열판 ${o.heatsink}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.rgb && `RGB ${formatValue(o.rgb)}`,
            o.modules && `${o.modules}모듈`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ SSD */
      case "ssd":
        lines = [
          [o.capacity, o.interface, o.form_factor].filter(Boolean).join(" / "),
          [
            o.sequential_read && `읽기 ${o.sequential_read}`,
            o.sequential_write && `쓰기 ${o.sequential_write}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.controller && `${o.controller}`,
            o.nand_structure && `${o.nand_structure}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ HDD */
      case "hdd":
        lines = [
          [o.capacity, o.interface].filter(Boolean).join(" / "),
          [o.rpm && `${o.rpm}RPM`, o.buffersize && `캐시 ${o.buffersize}`]
            .filter(Boolean)
            .join(" / "),
          [
            o.disksize && `${o.disksize}`,
            o.noiselevel && `소음 ${o.noiselevel}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ 쿨러 */
      case "cooler":
        lines = [
          [o.kind, o.cooling_method].filter(Boolean).join(" / "),
          [o.tdp && `TDP ${o.tdp}`, o.fan_size && `팬 ${o.fan_size}`]
            .filter(Boolean)
            .join(" / "),
          [o.height && `높이 ${o.height}`, o.noise && `소음 ${o.noise}`]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ 파워 */
      /** ✅ 파워 (확장 버전) */
      case "power":
        lines = [
          // 1. 출력/인증
          [
            o.ratedpower && `${o.ratedpower}W`,
            o.cert80plus && `${o.cert80plus}`,
          ]
            .filter(Boolean)
            .join(" / "),
          // 2. 모듈러/팬
          [
            o.modular && `모듈러 ${formatValue(o.modular)}`,
            o.fansize && `팬 ${o.fansize}`,
          ]
            .filter(Boolean)
            .join(" / "),
          // 3. PFC/레일
          [o.pfc && `PFC ${o.pfc}`, o.railtype && `레일 ${o.railtype}`]
            .filter(Boolean)
            .join(" / "),
          // 4. 커넥터
          [
            o.pcie8pin && `PCIe ${o.pcie8pin}`,
            o.sata && `SATA ${o.sata}`,
            o.ide4pin && `IDE ${o.ide4pin}`,
          ]
            .filter(Boolean)
            .join(" / "),
          // 5. 보증/제조사
          [
            o.warranty && `보증 ${o.warranty}`,
            o.manufacturer && `${o.manufacturer}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      /** ✅ 케이스 */
      case "case":
        lines = [
          [o.case_type, o.case_size].filter(Boolean).join(" / "),
          [
            o.max_vga_length && `VGA ${o.max_vga_length}`,
            o.max_cpu_cooler_height && `쿨러 ${o.max_cpu_cooler_height}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.front_panel_type && `전면 ${o.front_panel_type}`,
            o.side_panel_type && `측면 ${o.side_panel_type}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      default:
        lines = Object.entries(o)
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${formatValue(v)}`);
        break;
    }

    return (
      <div className="specs">
        {lines.filter(Boolean).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  };

  const pageGroup = Math.floor(page / 10);
  const startPage = pageGroup * 10;
  const endPage = Math.min(startPage + 10, totalPages);

  return (
    <div className="detail-page">
      {/* 사이드바 */}
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

          {/* 필터 */}
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

          {/* 상품 목록 */}
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
                        <h4 className="product-title">{p.name}</h4>
                        {renderSpecs(productName, p.options)}
                      </div>
                      <div className="price">
                        <span>최저가</span>
                        {p.lowestPrice?.price ? (
                          <div>
                            <strong className="price-number">
                              {parseInt(
                                String(p.lowestPrice.price).replace(
                                  /[^0-9]/g,
                                  "",
                                ),
                                10,
                              ).toLocaleString()}
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

            {/* 페이지네이션 */}
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
