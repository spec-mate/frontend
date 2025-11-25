import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "./styles/ProductDetailView.css";
import EstimateSelectModal from "../components/EstimateSelectModal";

export default function ProductDetailView() {
  // 🔥 수정됨: productName 추가
  const { productName, id } = useParams();

  const [product, setProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showModal, setShowModal] = useState(false);

  const categoryMap = {
    mainboard: "mainboard",
    cpu: "cpu",
    cpucooler: "cooler",
    cooler: "cooler",
    gpu: "gpu",
    power: "power",
    psu: "power",
    casefan: "casefan",
    case: "case",
  };

  const optionLabels = {
    brand: "제조회사",
    color: "색상",
    series: "시리즈",
    variant: "모델",
    core_family: "코어 패밀리",
    microarchitecture: "마이크로아키텍처",
    socket: "소켓",
    cores_total: "코어 수",
    threads: "스레드 수",
    base_clock_ghz: "기본 클럭(GHz)",
    boost_clock_ghz: "부스트 클럭(GHz)",
    l2_cache_mb: "L2 캐시(MB)",
    l3_cache_mb: "L3 캐시(MB)",
    lithography: "제조 공정",
    ecc_support: "ECC 지원",
    includes_cooler: "기본 쿨러 포함",
    integrated_graphics: "내장 그래픽",
    memory_support_max_gb: "메모리 최대 지원",
    memory_types: "지원 메모리 타입",
    packaging: "패키징",
    release_year: "출시 연도",
    tdp_watt: "TDP(W)",

    capacity_gb: "총 용량(GB)",
    module_capacity_gb: "모듈당 용량(GB)",
    modules: "모듈 수",
    speed_mhz: "속도(MHz)",
    cas_latency: "CAS 레이턴시",
    timings: "타이밍",
    voltage: "전압(V)",
    ram_type: "RAM 종류",
    form_factor: "폼팩터",
    heat_spreader: "히트스프레더",
    registered: "Registered/Buffered",
    rgb: "RGB",

    chipset_manufacturer: "칩셋 제조사",
    chipset: "칩셋",
    core_count: "코어 수",
    base_clock_mhz: "기본 클럭(MHz)",
    boost_clock_mhz: "부스트 클럭(MHz)",
    effective_memory_clock_mhz: "메모리 클럭(MHz)",
    memory_gb: "메모리 용량(GB)",
    memory_bus_bit: "버스폭(bit)",
    memory_type: "메모리 타입",
    interface: "인터페이스",
    tdp_w: "TDP(W)",
    slot_width: "슬롯 너비",
    length_mm: "길이(mm)",

    video_outputs_hdmi_2_1: "HDMI 2.1",
    video_outputs_displayport_2_1_b: "DisplayPort 2.1b",

    type: "종류",
    nand_type: "NAND 타입",
    read_speed: "읽기 속도",
    write_speed: "쓰기 속도",
    nvme: "NVMe 여부",

    wattage_w: "정격 출력(W)",
    efficiency_rating: "효율 등급",
    modular: "모듈러 방식",
    fanless: "팬리스 여부",

    connectors_sata: "SATA",
    connectors_eps_8_pin: "EPS 8-pin",
    connectors_atx_24_pin: "ATX 24-pin",
    connectors_molex_4_pin: "Molex 4-pin",
    connectors_floppy_4_pin: "Floppy 4-pin",
    connectors_pcie_12vhpwr: "PCIe 12VHPWR",
    connectors_pcie_6_plus_2_pin: "PCIe 6+2-pin",

    cpu_sockets: "지원 소켓",
    fan_bearing_type: "팬 베어링",
    fan_size_mm: "팬 크기(mm)",
    heat_pipes: "히트파이프",
    height_mm: "높이(mm)",
    max_fan_rpm: "최대 RPM",
    min_fan_rpm: "최소 RPM",
    max_noise_level: "최대 소음(dB)",
    min_noise_level: "최소 소음(dB)",
    max_tdp_w: "최대 TDP(W)",
    radiator_size: "라디에이터 크기(mm)",
    weight_g: "무게(g)",
    water_cooled: "수냉",

    dimensions_text: "전체 사이즈(mm)",
    expansion_slots: "확장 슬롯",
    front_usb_ports: "전면 USB 포트",
    internal_2_5_bays: `내부 2.5" 베이`,
    internal_3_5_bays: `내부 3.5" 베이`,
    max_gpu_length_mm: "GPU 최대 길이(mm)",
    max_cpu_cooler_height_mm: "CPU 쿨러 최대 높이(mm)",
    has_transparent_side_panel: "투명 패널",
    side_panel: "측면 패널",
    supported_psu_form_factors: "지원 PSU",
    weight_kg: "무게(kg)",
    volume_liters: "용량(L)",

    audio_chipset: "오디오 칩셋",
    raid_support: "RAID 지원",
    ram_slots: "램 슬롯 ",

    fan_headers_pump: "PUMP 헤더",
    fan_headers_cpu_fan: "CPU FAN 헤더",
    fan_headers_cpu_opt: "CPU OPT 헤더",
    fan_headers_case_fan: "CASE FAN 헤더",

    rgb_headers_argb_5v: "ARGB 5V 헤더",
    rgb_headers_rgb_12v: "RGB 12V 헤더",

    storage_devices_sata_6_gb_s: "SATA 6Gb/s 포트",

    usb_headers_usb_2_0: "USB 2.0 헤더",
    usb_headers_usb_3_2_gen_1: "USB 3.2 Gen1 헤더",
    usb_headers_usb_3_2_gen_2x2: "USB 3.2 Gen2x2 헤더",

    bios_features_flashback: "BIOS 플래시백",
  };

  const specKeys = {
    cpu: [
      "brand",
      "series",
      "variant",
      "socket",
      "cores_total",
      "threads",
      "base_clock_ghz",
      "boost_clock_ghz",
      "l2_cache_mb",
      "l3_cache_mb",
      "lithography",
      "tdp_watt",
      "includes_cooler",
      "integrated_graphics",
      "memory_support_max_gb",
      "ecc_support",
      "release_year",
      "packaging",
    ],

    ram: [
      "brand",
      "series",
      "variant",
      "capacity_gb",
      "module_capacity_gb",
      "modules",
      "speed_mhz",
      "cas_latency",
      "timings",
      "voltage",
      "ram_type",
      "form_factor",
      "heat_spreader",
      "rgb",
      "registered",
      "ecc",
      "color",
      "part_numbers",
    ],

    gpu: [
      "brand",
      "series",
      "variant",
      "chipset_manufacturer",
      "chipset",
      "core_count",
      "base_clock_mhz",
      "boost_clock_mhz",
      "effective_memory_clock_mhz",
      "memory_gb",
      "memory_bus_bit",
      "memory_type",
      "interface",
      "tdp_w",
      "slot_width",
      "length_mm",
      "color",
      "video_outputs_hdmi_2_1",
      "video_outputs_displayport_2_1_b",
      "frame_sync",
    ],

    storage: [
      "brand",
      "series",
      "variant",
      "type",
      "capacity_gb",
      "form_factor",
      "interface",
      "nvme",
      "nand_type",
      "read_speed",
      "write_speed",
    ],

    power: [
      "brand",
      "series",
      "variant",
      "color",
      "wattage_w",
      "efficiency_rating",
      "form_factor",
      "modular",
      "fanless",
      "length_mm",
      "connectors_sata",
      "connectors_eps_8_pin",
      "connectors_atx_24_pin",
      "connectors_molex_4_pin",
      "connectors_floppy_4_pin",
      "connectors_pcie_12vhpwr",
      "connectors_pcie_6_plus_2_pin",
    ],

    cooler: [
      "brand",
      "series",
      "variant",
      "color",
      "cpu_sockets",
      "fan_bearing_type",
      "fan_size_mm",
      "heat_pipes",
      "height_mm",
      "max_fan_rpm",
      "min_fan_rpm",
      "max_noise_level",
      "min_noise_level",
      "max_tdp_w",
      "radiator_size",
      "water_cooled",
      "weight_g",
      "part_numbers",
    ],

    case: [
      "brand",
      "series",
      "variant",
      "color",
      "form_factor",
      "dimensions_text",
      "expansion_slots",
      "front_usb_ports",
      "internal_2_5_bays",
      "internal_3_5_bays",
      "max_gpu_length_mm",
      "max_cpu_cooler_height_mm",
      "has_transparent_side_panel",
      "side_panel",
      "power_supply",
      "supported_psu_form_factors",
      "weight_kg",
      "volume_liters",
    ],

    mainboard: [
      "brand",
      "series",
      "variant",
      "socket",
      "chipset",
      "form_factor",
      "ram_type",
      "ram_slots",
      "storage_devices_sata_6_gb_s",
      "audio_chipset",
      "raid_support",
      "bios_features_flashback",
      "rgb_headers_argb_5v",
      "rgb_headers_rgb_12v",
      "color",
    ],
  };

  const formatValue = (v) =>
    v === true
      ? "O"
      : v === false
        ? "X"
        : Array.isArray(v)
          ? v.join(", ")
          : typeof v === "object"
            ? JSON.stringify(v)
            : v;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("상품 불러오기 실패:", err);
      }
    };
    load();
  }, [id]);

  if (!product) return <p>상품 불러오는 중...</p>;

  const optionsNormalized = {};

  Object.entries(product.detail || {}).forEach(([key, value]) => {
    if (key === "dimensions_mm" && typeof value === "object") {
      const { depth, width, height } = value;
      if (depth && width && height)
        optionsNormalized.dimensions_text = `${depth} x ${width} x ${height} mm`;
      return;
    }

    if (key === "video_outputs" && typeof value === "object") {
      Object.entries(value).forEach(([subKey, subVal]) => {
        optionsNormalized[`video_outputs_${subKey}`] = subVal;
      });
      return;
    }

    if (key === "connectors" && typeof value === "object") {
      Object.entries(value).forEach(([subKey, subVal]) => {
        optionsNormalized[`connectors_${subKey}`] = subVal;
      });
      return;
    }

    if (key === "audio" && typeof value === "object") {
      if (value.chipset) optionsNormalized.audio_chipset = value.chipset;
      return;
    }

    if (key === "bios_features" && typeof value === "object") {
      if (value.flashback !== undefined)
        optionsNormalized.bios_features_flashback = value.flashback;
      return;
    }

    if (key === "fan_headers" && typeof value === "object") {
      Object.entries(value).forEach(([subKey, subVal]) => {
        optionsNormalized[`fan_headers_${subKey}`] = subVal;
      });
      return;
    }

    if (key === "rgb_headers" && typeof value === "object") {
      Object.entries(value).forEach(([subKey, subVal]) => {
        optionsNormalized[`rgb_headers_${subKey}`] = subVal;
      });
      return;
    }

    if (key === "storage_devices" && typeof value === "object") {
      Object.entries(value).forEach(([subKey, subVal]) => {
        optionsNormalized[`storage_devices_${subKey}`] = subVal;
      });
      return;
    }

    if (key === "usb_headers" && typeof value === "object") {
      Object.entries(value).forEach(([subKey, subVal]) => {
        optionsNormalized[`usb_headers_${subKey}`] = subVal;
      });
      return;
    }

    if (key === "pcie_slots") {
      optionsNormalized.pcie_slots = value;
      return;
    }

    if (key === "m2_slots") {
      optionsNormalized.m2_slots = value;
      return;
    }

    optionsNormalized[key] = value;
  });

  // brand 추가
  if (product.brand) {
    optionsNormalized.brand = product.brand;
  }

  const rawType = product.category?.toLowerCase();
  const typeKey = categoryMap[rawType] || rawType;

  const typeLabelMap = {
    cpu: "프로세서",
    gpu: "그래픽카드",
    storage: "스토리지",
    ram: "메모리",
    mainboard: "메인보드",
    power: "파워서플라이",
    cooler: "쿨러",
    case: "케이스",
  };

  const typeLabel = typeLabelMap[typeKey] || product.category;

  const entries = (specKeys[typeKey] || [])
    .map((key) => [key, optionsNormalized[key]])
    .filter(([, v]) => v !== undefined && v !== null);

  const gridPairs = [];
  for (let i = 0; i < entries.length; i += 2)
    gridPairs.push([entries[i], entries[i + 1]]);

  return (
    <div className="product-detail-view">
      <div className="product-content">
        <div className="breadcrumb">
          <Link to="/info" className="breadcrumb-link">
            PC 부품 정보
          </Link>
          {" > "}

          {/* 🔥 수정됨: 목록으로 돌아갈 때 productName 사용 */}
          <Link
            to={`/product/${encodeURIComponent(productName)}`}
            className="breadcrumb-link"
          >
            {typeLabel}
          </Link>

          {" > "}
          <span>{product.name}</span>
        </div>

        <h2 className="product-title">{product.name}</h2>

        <div className="tags">
          <span>#{product.manufacturer}</span>
          <span>#{typeLabel}</span>
        </div>

        <div className="product-box">
          <div className="box-flex">
            <div className="box-image">
              <img
                src={product.image}
                alt={product.name}
                className="product-detail-image"
              />
            </div>

            <div className="box-spec">
              <div className="spec-mapping-grid">
                {entries.length === 0 && (
                  <p style={{ padding: "10px" }}>
                    출력할 스펙 정보가 없습니다.
                  </p>
                )}

                {typeKey === "mainboard" &&
                  optionsNormalized.pcie_slots &&
                  optionsNormalized.pcie_slots.length > 0 && (
                    <div className="spec-set">
                      <span className="spec-label">PCIe 슬롯</span>
                      <span className="spec-value">
                        {optionsNormalized.pcie_slots
                          .map(
                            (s) =>
                              `Gen ${s.gen}, Lanes ${s.lanes}, ${s.quantity}개`,
                          )
                          .join(" / ")}
                      </span>
                    </div>
                  )}

                {typeKey === "mainboard" &&
                  optionsNormalized.m2_slots &&
                  optionsNormalized.m2_slots.length > 0 && (
                    <div className="spec-set">
                      <span className="spec-label">M.2 슬롯</span>
                      <span className="spec-value">
                        {(() => {
                          const m = optionsNormalized.m2_slots[0];
                          return `${m.interface.trim()} (${m.key} Key) - ${m.size}`;
                        })()}
                      </span>
                    </div>
                  )}

                {gridPairs.map((pair, idx) => (
                  <React.Fragment key={idx}>
                    {pair[0] && (
                      <div className="spec-set">
                        <span className="spec-label">
                          {optionLabels[pair[0][0]] || pair[0][0]}
                        </span>
                        <span className="spec-value">
                          {formatValue(pair[0][1])}
                        </span>
                      </div>
                    )}

                    {pair[1] && (
                      <div className="spec-set">
                        <span className="spec-label">
                          {optionLabels[pair[1][0]] || pair[1][0]}
                        </span>
                        <span className="spec-value">
                          {formatValue(pair[1][1])}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="price-box">
            <span className="price-label">최저가</span>
            <strong className="price-value">
              {product.priceKrw
                ? Number(product.priceKrw).toLocaleString() + " 원"
                : "정보 없음"}
            </strong>

            <div className="price-actions">
              <button className="cart-btn" onClick={() => setShowModal(true)}>
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
      </div>

      {showModal && (
        <EstimateSelectModal
          product={product}
          onClose={() => setShowModal(false)}
          onSuccess={(msg, type = "success") => {
            setToastMessage(msg);
            setToastType(type);
            setShowToast(true);
            setShowModal(false);
          }}
        />
      )}

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
