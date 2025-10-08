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

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [page]);

  // ✅ 불리언 값 변환 함수
  const formatValue = (val) => {
    if (typeof val === "boolean") return val ? "O" : "X";
    if (val === "true") return "O";
    if (val === "false") return "X";
    return val;
  };

  // ✅ 스펙 매핑 함수 (모든 상품 최소 3줄)
  const renderSpecs = (type, options) => {
    if (!options) return null;

    const filteredOptions = Object.fromEntries(
      Object.entries(options).filter(
        ([key]) => key.toLowerCase() !== "manufacturer"
      )
    );

    let lines = [];

    const o = filteredOptions;

    switch (type) {
      case "cpu":
        lines = [
          [
            o.core && `${o.core}`,
            o.thread && `${o.thread}스레드`,
            o.memory_type,
            o.integrated_graphics && "내장그래픽 O",
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.base_clock && `기본 클럭: ${o.base_clock}`,
            o.boost_clock && `최대 클럭: ${o.boost_clock}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.l2_cache && `L2 캐시: ${o.l2_cache}`,
            o.l3_cache && `L3 캐시: ${o.l3_cache}`,
            o.tdp && `TDP: ${o.tdp}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [o.pcie && `PCIe ${o.pcie}`, o.speed && `${o.speed}`, o.architecture]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      case "ssd":
        lines = [
          [o.capacity, o.interface, o.protocol, o.form_factor]
            .filter(Boolean)
            .join(" / "),
          [
            o.memory_type,
            o.nand_structure,
            o.ram_included && `DRAM: ${formatValue(o.ram_included)}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.seq_read && `읽기속도: ${o.seq_read}`,
            o.seq_write && `쓰기속도: ${o.seq_write}`,
            o.controller,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.endurance && `내구성: ${o.endurance}`,
            o.warranty && `보증: ${o.warranty}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      case "gpu":
        lines = [
          [o.graphics_chipset, o.memory_type, o.capacity]
            .filter(Boolean)
            .join(" / "),
          [
            o.base_clock && `기본 클럭: ${o.base_clock}`,
            o.boost_clock && `최대 클럭: ${o.boost_clock}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [o.interface, o.cooling, o.fan, o.length && `길이: ${o.length}`]
            .filter(Boolean)
            .join(" / "),
          [
            o.power && `TDP: ${o.power}`,
            o.power_connector && `전원핀: ${o.power_connector}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      case "ram":
        lines = [
          [o.capacity, o.memory_type, o.speed].filter(Boolean).join(" / "),
          [o.timing, o.voltage, o.module_type].filter(Boolean).join(" / "),
          [o.channel, o.heatsink, o.rgb && `RGB: ${formatValue(o.rgb)}`]
            .filter(Boolean)
            .join(" / "),
          [
            o.height && `높이: ${o.height}`,
            o.ecc && `ECC: ${formatValue(o.ecc)}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      case "mainboard":
        lines = [
          [
            o.socket,
            o.chipset,
            o.form_factor,
            o.power_phase && `전원부 ${o.power_phase}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.memory_type,
            o.max_memory && `최대 ${o.max_memory}`,
            o.memory_slot && `슬롯 ${o.memory_slot}개`,
            o.dual_channel && `듀얼채널: ${formatValue(o.dual_channel)}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.pcie && `PCIe ${o.pcie}`,
            o.m2_slot && `M.2 ${o.m2_slot}`,
            o.sata_port && `SATA ${o.sata_port}`,
            o.usb_port && `USB ${o.usb_port}`,
          ]
            .filter(Boolean)
            .join(" / "),
          [
            o.lan && `LAN: ${o.lan}`,
            o.wifi && `WiFi: ${formatValue(o.wifi)}`,
            o.bluetooth && `Bluetooth: ${formatValue(o.bluetooth)}`,
            o.audio_chip && `오디오: ${o.audio_chip}`,
            o.bios && `BIOS: ${o.bios}`,
          ]
            .filter(Boolean)
            .join(" / "),
        ];
        break;

      default:
        // 기본형: 4줄 중 최소 3줄
        lines = Object.entries(o)
          .filter(([k]) => k.toLowerCase() !== "manufacturer")
          .slice(0, 4)
          .map(([k, v]) => `${k}: ${formatValue(v)}`);
        break;
    }

    // ✅ 항상 최소 3줄 보장
    const allEntries = Object.entries(o)
      .filter(([k]) => k.toLowerCase() !== "manufacturer")
      .map(([k, v]) => `${k}: ${formatValue(v)}`);

    while (
      lines.filter(Boolean).length < 3 &&
      allEntries.length > lines.length
    ) {
      lines.push(allEntries[lines.length]);
    }

    return (
      <div className="specs">
        {lines
          .filter(Boolean)
          .slice(0, 4)
          .map((line, i) => (
            <p key={i}>{line}</p>
          ))}
      </div>
    );
  };

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
                                  ""
                                ),
                                10
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
