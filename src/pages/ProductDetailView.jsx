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

  /* ==================== 옵션 한글명 매핑 ==================== */
  const optionLabels = {
    // 공통
    manufacturer: "제조회사",
    socket: "소켓 구분",
    core: "코어 수",
    thread: "스레드 수",
    base_clock: "기본 클럭",
    max_clock: "최대 클럭",
    l2_cache: "L2 캐시",
    l3_cache: "L3 캐시",
    tdp: "TDP",
    generation: "세대",
    memory_type: "메모리 규격",
    memory_clock: "메모리 클럭",
    integrated_graphics: "내장 그래픽",
    pcie: "PCIe 버전",

    // GPU
    chipset_vendor: "칩셋 벤더",
    chipset: "칩셋",
    process: "제조 공정",
    boost_clock: "부스트 클럭",
    cuda_cores: "쿠다코어/스트림프로세서",
    memory_capacity: "메모리 용량",
    memory_bus: "메모리 버스폭",
    pcie_interface: "PCIe 인터페이스",
    recommended_psu: "권장 파워 용량",
    power_connectors: "전원 커넥터",
    length: "제품 길이",
    fan_count: "팬 수",
    backplate: "백플레이트",

    // Mainboard
    vrm: "전원부(페이즈)",
    xmp_support: "XMP 지원",
    expo_support: "EXPO 지원",
    pcie_x16_slots: "PCIe x16 슬롯",
    pcie_x1_slots: "PCIe x1 슬롯",
    m2_interface: "M.2 인터페이스",
    m2_heatsink: "M.2 히트싱크",
    usb_10gbps: "USB 10Gbps 포트",
    usb_5gbps: "USB 5Gbps 포트",
    usb_2_0: "USB 2.0 포트",
    usb_a: "USB-A 포트",
    usb_c: "USB-C 포트",
    lan_ports: "LAN 포트 수",
    lan_chipset: "LAN 칩셋",
    lan_speed: "LAN 속도",
    audio_chipset: "오디오 칩셋",
    audio_jacks: "오디오 잭",
    bios_flashback: "BIOS 플래시백",
    fan_headers: "팬 헤더",
    io_headers: "I/O 헤더",
    uefi_support: "UEFI 지원",
    rgb: "RGB 지원",

    // RAM
    manufacturer: "제조회사",
    memorytype: "메모리 규격",
    formfactor: "폼팩터",
    capacity: "용량",
    speed: "속도(MHz)",
    timing: "지연시간(CL)",
    voltage: "전압(V)",
    modules: "모듈 수",
    expo: "EXPO 지원",
    xmp: "XMP 지원",
    xmp3: "XMP 3.0 지원",
    heatsink: "방열판",
    ledlight: "LED 지원",
    ledcolor: "LED 색상",
    height: "높이(mm)",
    thickness: "두께(mm)",
    ondieecc: "On-Die ECC 지원",

    // SSD
    manufacturer: "제조회사",
    product_category: "제품분류",
    form_factor: "폼팩터",
    interface: "인터페이스",
    protocol: "프로토콜",
    capacity: "용량",
    memory_type: "낸드타입",
    nand_structure: "낸드 구조",
    ram_included: "DRAM 포함여부",
    ram_type: "DRAM 타입/용량",
    controller: "컨트롤러",
    sequential_read: "순차 읽기",
    sequential_write: "순차 쓰기",
    read_iops: "읽기 IOPS",
    write_iops: "쓰기 IOPS",
    tbw: "내구성(TBW)",
    mtbf: "MTBF",
    nvme_heatsink: "방열판 포함",
    // / HDD
    manufacturer: "제조회사",
    producttype: "용도/분류",
    disksize: "디스크 크기",
    capacity: "용량",
    interface: "인터페이스",
    rpm: "회전 속도",
    buffersize: "캐시 메모리(버퍼)",
    transferspeed: "전송 속도",
    recordingmethod: "기록 방식",
    diskcount: "디스크 수",
    thickness: "두께(mm)",
    heliumfilled: "헬륨 충전여부",
    workload: "내구성(TBW)",
    warrantyusage: "보증/내구성 TB",
    noiselevel: "소음(dB)",
    regdate: "출시일",

    // ✅ PSU (JSON 기반)
    manufacturer: "제조회사",
    kind: "폼팩터/규격",
    ratedpower: "정격 출력(W)",
    cert80plus: "80PLUS 인증",
    modular: "모듈러",
    fansize: "팬 크기(mm)",
    fancount: "팬 수",
    bearing: "베어링 종류",
    depth: "길이(mm)",
    warranty: "보증기간",
    mainconnector: "메인커넥터",
    pcie8pin: "PCIe 8핀",
    sata: "SATA 커넥터",
    ide4pin: "IDE 커넥터",
    railtype: "출력 레일",
    pfc: "PFC 방식",

    // Cooler
    kind: "종류",
    cooling_method: "냉각 방식",
    air_type: "타워 형태",
    intel_socket: "인텔 소켓",
    amd_socket: "AMD 소켓",
    width: "가로(mm)",
    depth: "세로(mm)",
    height: "높이(mm)",
    weight: "무게(kg)",
    connector: "커넥터",
    max_airflow: "최대 풍량",
    static_pressure: "정압",
    pwm: "PWM 지원",
    led: "LED 지원",

    // Case
    case_type: "케이스 타입",
    case_size: "케이스 크기",
    supported_power: "지원 파워 규격",
    power_included: "파워 포함 여부",
    max_vga_length: "최대 VGA 길이",
    max_cpu_cooler_height: "최대 쿨러 높이",
    power_length: "파워 길이",
    front_panel_type: "전면 패널",
    side_panel_type: "측면 패널",
    side_opening: "측면 개폐 방식",
    dust_filter: "먼지 필터",
    total_fans: "총 팬 수",
    led_fans: "LED 팬 수",
    radiator_top: "상단 라디에이터 지원",
    radiator_rear: "후면 라디에이터 지원",
  };

  /* ==================== 제품군별 스펙 키 ==================== */
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
      "tdp",
      "generation",
      "pcie",
      "memory_type",
      "integrated_graphics",
      "memory_clock",
    ],
    vga: [
      "chipset_vendor",
      "chipset",
      "process",
      "base_clock",
      "boost_clock",
      "cuda_cores",
      "memory_type",
      "memory_capacity",
      "memory_bus",
      "pcie_interface",
      "tdp",
      "recommended_psu",
      "power_connectors",
      "length",
      "fan_count",
      "backplate",
    ],
    mainboard: [
      "manufacturer",
      "socket",
      "chipset",
      "vrm",
      "xmp_support",
      "expo_support",
      "pcie_x16_slots",
      "pcie_x1_slots",
      "m2_interface",
      "m2_heatsink",
      "hdmi",
      "displayport",
      "usb_10gbps",
      "usb_5gbps",
      "usb_2_0",
      "usb_a",
      "usb_c",
      "lan_ports",
      "lan_chipset",
      "lan_speed",
      "audio_chipset",
      "audio_jacks",
      "bios_flashback",
      "fan_headers",
      "io_headers",
      "uefi_support",
      "rgb",
    ],
    ram: [
      "manufacturer",
      "capacity",
      "type",
      "speed",
      "latency",
      "voltage",
      "low_voltage",
      "xmp",
      "expo",
      "module",
      "channel",
      "ecc",
      "heatspreader",
      "height",
      "color",
      "rgb",
      "manufacturer",
      "memorytype",
      "formfactor",
      "capacity",
      "speed",
      "timing", // CL 값
      "voltage",
      "modules",
      "expo",
      "xmp",
      "xmp3",
      "heatsink",
      "ledlight",
      "ledcolor",
      "height",
      "thickness",
      "ondieecc",
      "intel_support",
      "amd_support",
    ],
    ssd: [
      "manufacturer",
      "product_category",
      "form_factor",
      "interface",
      "protocol",
      "capacity",
      "memory_type", // TLC/MLC/SLC
      "nand_structure", // 3D낸드, 2D낸드 등
      "ram_included", // Dram_included, Dramless 등
      "ram_type", // DDR3/DDR4
      "controller",
      "sequential_read",
      "sequential_write",
      "read_iops",
      "write_iops",
      "tbw",
      "mtbf",
      "nvme_heatsink", // 히트싱크 포함/미포함
    ],
    hdd: [
      "manufacturer",
      "producttype",
      "disksize",
      "capacity",
      "interface",
      "rpm",
      "buffersize",
      "transferspeed",
      "recordingmethod",
      "diskcount",
      "thickness",
      "heliumfilled",
      "workload",
      "warrantyusage",
      "noiselevel",
      "regdate",
    ],
    power: [
      "manufacturer", // 제조회사
      "kind", // 폼팩터/규격
      "ratedpower", // 정격 출력(W)
      "cert80plus", // 80PLUS 인증
      "modular", // 모듈러
      "fansize", // 팬 크기(mm)
      "fancount", // 팬 수
      "bearing", // 베어링 종류
      "depth", // 파워 길이(mm)
      "warranty", // 보증기간
      "railtype", // 출력 레일
      "pfc", // 액티브 PFC
      "mainconnector", // 메인 커넥터(24/20핀)
      "pcie8pin", // PCIe 8핀 수
      "sata", // SATA 커넥터 수
      "ide4pin", // IDE 4핀 수"manufacturer",
      "kind",
      "ratedpower",
      "cert80plus",
      "modular",
      "fansize",
      "fancount",
      "bearing",
      "depth",
      "warranty",
      "mainconnector",
      "pcie8pin",
      "sata",
      "ide4pin",
      "railtype",
      "pfc",
    ],
    cooler: [
      "manufacturer",
      "kind",
      "cooling_method",
      "air_type",
      "tdp",
      "intel_socket",
      "amd_socket",
      "width",
      "depth",
      "height",
      "weight",
      "connector",
      "bearing_type",
      "max_airflow",
      "static_pressure",
      "pwm",
      "led",
    ],
    case: [
      "manufacturer",
      "case_type",
      "case_size",
      "supported_power",
      "power_included",
      "max_vga_length",
      "max_cpu_cooler_height",
      "power_length",
      "front_panel_type",
      "side_panel_type",
      "side_opening",
      "dust_filter",
      "total_fans",
      "led_fans",
      "radiator_top",
      "radiator_rear",
    ],
  };

  /* ==================== 가격 포맷 ==================== */
  const formatPrice = (price) => {
    if (!price) return null;
    const numeric = Number(String(price).replace(/,/g, ""));
    return isNaN(numeric) ? null : numeric.toLocaleString();
  };

  /* ==================== 데이터 Fetch ==================== */
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

  /* ==================== 옵션 정규화 (한글→영문 변환 포함) ==================== */
  const optionsNormalized = {};
  Object.entries(product.options || {}).forEach(([key, value]) => {
    const keyTrimmed = key.trim();

    const koreanToEnglish = {
      // PSU
      정격출력: "wattage",
      효율: "efficiency",
      인증: "certification",
      모듈러: "modular",
      팬크기: "fan_size",
      베어링: "bearing_type",
      보호회로: "protection_features",
      길이: "length",
      무게: "weight",
      보증기간: "warranty",
      // RAM
      용량: "capacity",
      타입: "type",
      속도: "speed",
      지연시간: "latency",
      전압: "voltage",
      xmp: "xmp",
      방열판: "heatspreader",
    };

    const mappedKey = koreanToEnglish[keyTrimmed] || keyTrimmed;

    const normalizedKey = mappedKey
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[\(\)\/]/g, "_")
      .replace(/[^a-z0-9가-힣_]/gi, "_");

    optionsNormalized[normalizedKey] = value;
  });

  /* ==================== 스펙 매핑 ==================== */
  const typeKey = product.type?.toLowerCase();
  const typeLabelMap = {
    cpu: "프로세서",
    gpu: "그래픽카드",
    ssd: "SSD",
    hdd: "하드디스크",
    ram: "메모리",
    mainboard: "메인보드",
    power: "파워서플라이",
    cooler: "쿨러",
    case: "케이스",
  };
  const typeLabel = typeLabelMap[typeKey] || product.type;

  const entries = (specKeys[typeKey] || [])
    .map((key) => [
      key,
      key === "manufacturer"
        ? product.manufacturer
        : optionsNormalized[key] || product.options?.[key],
    ])
    .filter(([, v]) => v !== undefined && v !== null)
    .slice(0, 16);

  const gridPairs = [];
  for (let i = 0; i < entries.length; i += 2) {
    gridPairs.push([entries[i], entries[i + 1]]);
  }

  /* ==================== 견적 저장 ==================== */
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

  /* ==================== 렌더링 ==================== */
  return (
    <div className="product-detail-view">
      <div className="product-content">
        <div className="breadcrumb">
          <Link to="/info" className="breadcrumb-link">
            PC 부품 정보
          </Link>{" "}
          &gt;{" "}
          <Link
            to={`/product/${encodeURIComponent(product.type)}`}
            className="breadcrumb-link"
          >
            {typeLabel}
          </Link>{" "}
          &gt; <span>{product.name}</span>
        </div>
        <h2 className="product-title">{product.name}</h2>
        <div className="tags">
          <span>#{product.manufacturer}</span>
          <span>#{typeLabel}</span>
          <span>등록일: {product.regDate || product.reg_date}</span>
        </div>

        {/* 상세 박스 */}
        <div className="product-box">
          <div className="box-flex">
            <div className="box-image">
              <img
                src={product.image || "/no-image.svg"}
                alt={product.name}
                className="product-detail-image"
              />
            </div>
            <div className="box-spec">
              <div className="spec-mapping-area">
                <div className="spec-mapping-grid">
                  {gridPairs.map((pair, idx) => (
                    <React.Fragment key={idx}>
                      {pair[0] && (
                        <div className="spec-set">
                          <span className="spec-label">
                            {optionLabels[pair[0][0]] || pair[0][0]}
                          </span>
                          <span className="spec-value">
                            {Array.isArray(pair[0][1])
                              ? pair[0][1].join(", ")
                              : String(pair[0][1])}
                          </span>
                        </div>
                      )}
                      {pair[1] && (
                        <div className="spec-set">
                          <span className="spec-label">
                            {optionLabels[pair[1][0]] || pair[1][0]}
                          </span>
                          <span className="spec-value">
                            {Array.isArray(pair[1][1])
                              ? pair[1][1].join(", ")
                              : String(pair[1][1])}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 가격 */}
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

        {/* 용도별 추천 */}
        <div className="recommend-section">
          <div className="recommend-overlay-text">
            <h3>스펙메이트의 용도별 조합 추천!</h3>
            <p>박스를 클릭해보세요!</p>
          </div>
          <div className="recommend-cards">
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
          </div>
        </div>
      </div>

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
