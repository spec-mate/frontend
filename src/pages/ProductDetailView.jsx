// src/pages/ProductDetailView.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "./styles/ProductDetailView.css";

export default function ProductDetailView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedBuild, setSelectedBuild] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  const optionLabels = {
    manufacturer: "제조회사",
    socket: "소켓 구분",
    core: "코어 수",
    thread: "스레드 수",
    memory_type: "메모리 규격",
    integrated_graphics: "내장 그래픽",
    generation: "세대",
    base_clock: "기본 클럭",
    max_clock: "최대 클럭",
    l2_cache: "L2 캐시",
    l3_cache: "L3 캐시",
    TDP: "TDP",
    pcie: "PCIe 버전",
    memory_clock: "메모리 클럭",
    chipset: "칩셋",
    m2_interface: "M.2 인터페이스",
    m2_heatsink: "M.2 히트싱크",
    pcie_x16_slots: "PCIe x16 슬롯",
    pcie_x1_slots: "PCIe x1 슬롯",
    usb_a: "USB-A 포트",
    usb_c: "USB-C 포트",
    usb_2_0: "USB 2.0",
    usb_5gbps: "USB 5Gbps",
    usb_10gbps: "USB 10Gbps",
    lan_chipset: "LAN 칩셋",
    lan_ports: "LAN 포트",
    capacity: "용량",
    interface: "인터페이스",
    form_factor: "폼팩터",
    sequential_read: "순차 읽기",
    sequential_write: "순차 쓰기",
    nand_type: "NAND 타입",
    dram_cache: "DRAM 캐시",
    TBW: "내구성(TBW)",
    MTBF: "MTBF",
    type: "타입",
    speed: "속도",
    latency: "지연시간",
    module: "모듈",
    voltage: "전압",
    ecc: "ECC 지원",
    wattage: "출력(W)",
    efficiency: "효율",
    modular: "모듈러",
    fan_size: "팬 크기",
    certification: "인증",
    connector_count: "커넥터 수",
    protection_features: "보호 기능",
    rpm: "회전 속도",
    cache: "캐시",
    noise: "소음",
    power_consumption: "전력 소비",
    cooler_type: "쿨러 타입",
    airflow: "에어플로우",
    compatible_socket: "호환 소켓",
    TDP_rating: "TDP 지원",
    max_gpu_length: "최대 GPU 길이",
    max_cooler_height: "최대 쿨러 높이",
    max_psu_length: "최대 PSU 길이",
    drive_bays: "드라이브 베이",
    expansion_slots: "확장 슬롯",
    front_io: "전면 I/O",
    cooling_support: "쿨링 지원",
    memory_size: "메모리 용량",
    boost_clock: "부스트 클럭",
    outputs: "출력 포트",
  };

  const specKeys = {
    cpu: [
      "manufacturer",
      "socket",
      "core",
      "thread",
      "base_clock",
      "max_clock",
      "l2_cache",
      "l3_cache",
      "memory_type",
      "integrated_graphics",
      "tdp",
      "generation",
      "pcie",
      "memory_clock",
    ],
    mainboard: [
      "manufacturer",
      "socket",
      "chipset",
      "memory_type",
      "memory_clock",
      "m2_interface",
      "m2_heatsink",
      "pcie_x16_slots",
      "pcie_x1_slots",
      "usb_a",
      "usb_c",
      "usb_2_0",
      "usb_5gbps",
      "usb_10gbps",
      "lan_chipset",
      "lan_ports",
    ],
    vga: [
      "manufacturer",
      "chipset",
      "memory_size",
      "memory_type",
      "base_clock",
      "boost_clock",
      "tdp",
      "pcie",
      "outputs",
      "cooler_type",
    ],
    gpu: [
      "manufacturer",
      "chipset",
      "memory_size",
      "memory_type",
      "base_clock",
      "boost_clock",
      "tdp",
      "pcie",
      "outputs",
      "cooler_type",
    ],
    ssd: [
      "manufacturer",
      "capacity",
      "interface",
      "form_factor",
      "sequential_read",
      "sequential_write",
      "nand_type",
      "dram_cache",
      "tbw",
      "mtbf",
    ],
    ram: [
      "manufacturer",
      "capacity",
      "type",
      "speed",
      "latency",
      "module",
      "voltage",
      "ecc",
      "xmp_support",
    ],
    power: [
      "manufacturer",
      "wattage",
      "efficiency",
      "modular",
      "fan_size",
      "certification",
      "connector_count",
      "protection_features",
    ],
    hdd: [
      "manufacturer",
      "capacity",
      "rpm",
      "cache",
      "interface",
      "form_factor",
      "noise",
      "power_consumption",
    ],
    cooler: [
      "manufacturer",
      "type",
      "fan_size",
      "rpm",
      "airflow",
      "noise",
      "compatible_socket",
      "tdp_rating",
    ],
    case: [
      "manufacturer",
      "form_factor",
      "max_gpu_length",
      "max_cooler_height",
      "max_psu_length",
      "drive_bays",
      "expansion_slots",
      "front_io",
      "cooling_support",
    ],
  };

  const formatPrice = (price) => {
    if (!price) return null;
    const numeric = Number(String(price).replace(/,/g, ""));
    return isNaN(numeric) ? null : numeric.toLocaleString();
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("상품 불러오기 실패:", err.response || err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>상품 불러오는 중...</p>;

  const handleSaveToEstimate = async () => {
    try {
      await api.post("/estimate/products/save", {
        productId: product.id,
        category: product.type,
        quantity: 1,
        productImage: product.image,
      });
      setToastMessage("견적 보관함에 저장했어요!");
      setToastType("success");
      setShowToast(true);
    } catch (err) {
      console.error("저장 실패:", err.response || err);
      setToastMessage("저장에 실패했어요. 다시 시도해주세요.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleCardClick = (build) => {
    setSelectedBuild((prev) => (prev === build ? null : build));
  };

  const typeKey = product.type?.toLowerCase();
  const typeLabelMap = {
    cpu: "프로세서",
    vga: "그래픽카드",
    gpu: "그래픽카드",
    ssd: "SSD",
    hdd: "하드디스크",
    ram: "메모리",
    mainboard: "메인보드",
    power: "파워",
    cooler: "쿨러",
    case: "케이스",
  };
  const typeLabel = typeLabelMap[typeKey] || product.type;

  const optionsNormalized = {};
  Object.entries(product.options || {}).forEach(([k, v]) => {
    optionsNormalized[k.toLowerCase()] = v;
  });

  const entries = (specKeys[typeKey] || [])
    .map((key) => [
      key,
      key === "manufacturer" ? product.manufacturer : optionsNormalized[key],
    ])
    .filter(([, v]) => v !== undefined && v !== null)
    .slice(0, 15);

  return (
    <div className="product-detail-view">
      <div></div>
      <div className="product-content">
        <div className="breadcrumb">
          <Link to="/info">PC 부품 정보</Link> &gt;{" "}
          <Link to={`/product/${encodeURIComponent(product.type)}`}>
            {typeLabel}
          </Link>
        </div>

        <h2 className="product-title">{product.name}</h2>

        <div className="tags">
          <span>#{product.manufacturer}</span>
          <span>#{typeLabel}</span>
          <span>등록일: {product.regDate}</span>
        </div>

        <div className="product-box">
          <div className="product-info">
            <div className="left">
              <img
                src={product.image || "/no-image.svg"}
                alt={product.name}
                className="product-detail-image"
              />
            </div>
            <div className="right">
              <div className="specs-tables">
                <table>
                  <tbody>
                    {entries.map(([key, value]) => (
                      <tr key={key}>
                        <td>{optionLabels[key] || key}</td>
                        <td>{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="price-box">
            <span className="price-label">최저가</span>
            <strong className="price-value">
              {product.lowestPrice?.price ? (
                <>
                  <span className="price-number">
                    {formatPrice(product.lowestPrice.price)}
                  </span>
                  <span className="price-unit"> 원</span>
                </>
              ) : (
                "정보 없음"
              )}
            </strong>

            <div className="price-actions">
              {product.lowestPrice?.link && (
                <a
                  href={product.lowestPrice.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-btn"
                >
                  <span className="btn-icon"></span>
                </a>
              )}
              <button className="cart-btn" onClick={handleSaveToEstimate}>
                <span className="btn-icon">
                  <img src="/cart.svg" alt="장바구니" />
                </span>
                <div className="cart-text">
                  <small className="cart-subtitle">나만의 견적 보관함</small>
                  <span className="cart-main">보관하기</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="recommend-section">
          <div className="recommend-overlay-text">
            <h3>스펙메이트의 용도별 조합 추천!</h3>
            <p>박스를 클릭해보세요!</p>
          </div>

          <div className="recommend-cards">
            <div>
              {selectedBuild === "office" ? (
                <div
                  className="build-list fixed-slot"
                  onClick={() => handleCardClick("office")}
                >
                  <h4>사무용 PC 추천 부품</h4>
                  <ul>
                    {[].map((b, idx) => (
                      <li key={idx}>
                        <strong>{b.category}</strong>: {b.part}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  className="recommend-card"
                  onClick={() => handleCardClick("gaming")}
                >
                  <img src="/gaming.svg" alt="게이밍 PC" />
                  <div className="recommend-label">게이밍</div>
                  <div className="recommend-desc">
                    최신 부품 조합으로 최적의 게임환경을 보장하는 게이밍 PC
                  </div>
                </div>
              )}
            </div>

            <div>
              {selectedBuild === "gaming" ? (
                <div
                  className="build-list fixed-slot"
                  onClick={() => handleCardClick("gaming")}
                >
                  <h4>게이밍 PC 추천 부품</h4>
                  <ul>
                    {[].map((b, idx) => (
                      <li key={idx}>
                        <strong>{b.category}</strong>: {b.part}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  className="recommend-card"
                  onClick={() => handleCardClick("office")}
                >
                  <img src="/affairs.svg" alt="사무용 PC" />
                  <div className="recommend-label">사무용</div>
                  <div className="recommend-desc">
                    업무와 멀티태스킹에 최적화된 안정적이고 조용한 사무용 PC
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div></div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
