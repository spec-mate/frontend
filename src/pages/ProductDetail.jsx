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

  // 한글 라벨 매핑
  const labelMap = {
    cpu: {
      core: "코어",
      thread: "스레드",
      memory_type: "메모리 타입",
      base_clock: "기본 클럭",
      boost_clock: "부스트 클럭",
      l3_cache: "L3 캐시",
      tdp: "TDP",
    },
    ssd: {
      capacity: "용량",
      interface: "인터페이스",
      form_factor: "폼팩터",
      seq_read: "순차 읽기",
      seq_write: "순차 쓰기",
    },
    gpu: {
      graphics_chipset: "칩셋",
      memory_type: "메모리 타입",
      capacity: "메모리 용량",
      boost_clock: "부스트 클럭",
      length: "길이",
    },
    ram: {
      capacity: "용량",
      memory_type: "메모리 타입",
      speed: "속도",
      channel: "채널",
      heatsink: "방열판",
      rgb: "RGB",
    },
    hdd: {
      capacity: "용량",
      rpm: "회전속도(RPM)",
      interface: "인터페이스",
      buffer: "버퍼",
      form_factor: "폼팩터",
      thickness: "두께",
    },
    cooler: {
      type: "쿨러 타입",
      height: "높이",
      noise: "소음",
      led: "LED",
      tdp: "TDP 지원",
      fan_size: "팬 크기",
      fan_count: "팬 개수",
    },
    power: {
      wattage: "정격 출력",
      certification: "효율 인증",
      modular: "모듈러",
      pfc: "PFC",
      fan_size: "팬 크기",
    },
    case: {
      case_type: "케이스 타입",
      case_size: "케이스 크기",
      atx: "ATX 지원",
      e_atx: "E-ATX 지원",
      m_atx: "M-ATX 지원",
      "m-itx": "M-ITX 지원",
      max_vga_length: "최대 VGA 길이",
      max_cpu_cooler_height: "최대 CPU 쿨러 높이",
      power_included: "파워포함",
      supported_power: "지원 파워 규격",
      bay_8_9cm: "베이(8.9cm)",
      bay_6_4cm: "베이(6.4cm)",
      max_storage: "최대 저장장치 수",
      pci_slots: "PCI 슬롯 개수",
      front_panel_type: "전면 패널",
      side_panel_type: "측면 패널",
      side_opening: "측면 오픈 방식",
      dust_filter: "먼지필터",
      total_fans: "총 팬 개수",
      led_fans: "LED 팬 개수",
      led_back: "LED 팬(후면)",
      led_side: "LED 팬(측면)",
      usb2: "USB2.0",
      usb3: "USB3.0",
      "usb-c_type_5gbps": "USB-C(5Gbps)",
      width: "너비",
      depth: "깊이",
      height: "높이",
      power_length: "파워 최대 길이",
      power_position: "파워 위치",
      max_watercooler_support: "최대 수랭 쿨러 지원",
      radiator_top: "수랭(top)",
      radiator_rear: "수랭(rear)",
    },
  };

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
            size: 15,
            manufacturer: selectedManufacturer || null,
          },
        });

        let items = res.data.content || [];

        if (searchQuery.trim()) {
          items = items.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        if (selectedSort === "asc") {
          items.sort((a, b) => {
            const priceA = parseInt(
              a.lowestPrice?.price ?? Number.MAX_SAFE_INTEGER,
              10,
            );
            const priceB = parseInt(
              b.lowestPrice?.price ?? Number.MAX_SAFE_INTEGER,
              10,
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
  }, [
    apiType,
    page,
    selectedManufacturer,
    selectedSort,
    searchQuery,
    setProgress,
  ]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [page]);

  const formatValue = (val) => {
    if (typeof val === "boolean") return val ? "O" : "X";
    if (val === "true") return "O";
    if (val === "false") return "X";
    return val;
  };

  // 한글 라벨과 /구분 3줄 출력 적용
  const renderSpecs = (type, options) => {
    if (!options) return null;
    const o = options;
    let lines = [];
    const map = labelMap[type] || {};

    switch (type) {
      case "case": {
        // 중요 5개, 3줄에 /로 구분
        const line1Arr = [o.case_type, o.case_size]
          .map((v, idx) =>
            v
              ? `${map[["case_type", "case_size"][idx]]}: ${formatValue(v)}`
              : null,
          )
          .filter(Boolean);
        const line2Arr = [o.max_vga_length, o.max_cpu_cooler_height]
          .map((v, idx) =>
            v
              ? `${map[["max_vga_length", "max_cpu_cooler_height"][idx]]}: ${formatValue(v)}`
              : null,
          )
          .filter(Boolean);
        const line3 = o.supported_power
          ? `${map.supported_power}: ${formatValue(o.supported_power)}`
          : "";

        lines = [line1Arr.join(" / "), line2Arr.join(" / "), line3];
        break;
      }
      case "cpu":
        lines = [
          [
            o.core && `${map.core}: ${o.core}`,
            o.thread && `${map.thread}: ${o.thread}`,
            o.memory_type && `${map.memory_type}: ${o.memory_type}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.base_clock && `${map.base_clock}: ${o.base_clock}`,
            o.boost_clock && `${map.boost_clock}: ${o.boost_clock}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.l3_cache && `${map.l3_cache}: ${o.l3_cache}`,
            o.tdp && `${map.tdp}: ${o.tdp}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      case "ssd":
        lines = [
          [
            o.capacity && `${map.capacity}: ${o.capacity}`,
            o.interface && `${map.interface}: ${o.interface}`,
            o.form_factor && `${map.form_factor}: ${o.form_factor}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.seq_read && `${map.seq_read}: ${o.seq_read}`,
            o.seq_write && `${map.seq_write}: ${o.seq_write}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      case "gpu":
        lines = [
          [
            o.graphics_chipset &&
              `${map.graphics_chipset}: ${o.graphics_chipset}`,
            o.memory_type && `${map.memory_type}: ${o.memory_type}`,
            o.capacity && `${map.capacity}: ${o.capacity}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.boost_clock && `${map.boost_clock}: ${o.boost_clock}`,
            o.length && `${map.length}: ${o.length}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      case "ram":
        lines = [
          [
            o.capacity && `${map.capacity}: ${o.capacity}`,
            o.memory_type && `${map.memory_type}: ${o.memory_type}`,
            o.speed && `${map.speed}: ${o.speed}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.channel && `${map.channel}: ${o.channel}`,
            o.heatsink && `${map.heatsink}: ${o.heatsink}`,
            o.rgb !== undefined && `${map.rgb}: ${formatValue(o.rgb)}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      case "hdd":
        lines = [
          [
            o.capacity && `${map.capacity}: ${o.capacity}`,
            o.rpm && `${map.rpm}: ${o.rpm}`,
            o.interface && `${map.interface}: ${o.interface}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.buffer && `${map.buffer}: ${o.buffer}`,
            o.form_factor && `${map.form_factor}: ${o.form_factor}`,
            o.thickness && `${map.thickness}: ${o.thickness}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      case "cooler":
        lines = [
          [
            o.type && `${map.type}: ${o.type}`,
            o.height && `${map.height}: ${o.height}`,
            o.noise && `${map.noise}: ${o.noise}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.led !== undefined && `${map.led}: ${formatValue(o.led)}`,
            o.tdp && `${map.tdp}: ${o.tdp}`,
            o.fan_size && `${map.fan_size}: ${o.fan_size}`,
            o.fan_count && `${map.fan_count}: ${o.fan_count}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      case "power":
        lines = [
          [
            o.wattage && `${map.wattage}: ${o.wattage}`,
            o.certification && `${map.certification}: ${o.certification}`,
            o.modular !== undefined &&
              `${map.modular}: ${formatValue(o.modular)}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.pfc && `${map.pfc}: ${o.pfc}`,
            o.fan_size && `${map.fan_size}: ${o.fan_size}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;
      default:
        lines = Object.entries(o)
          .slice(0, 3)
          .map(([k, v]) => `${map[k] || k}: ${formatValue(v)}`);
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

  return (
    <div className="detail-page">
      {/* 왼쪽 사이드바 */}
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

          {/* 필터 테이블 + 검색창 */}
          <div className="filter-bar">
            <div className="filter-table">
              {/* 제조사 */}
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

              {/* 정렬 */}
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

            {/* 검색창 */}
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
          </section>
        </div>
      </div>
    </div>
  );
}
