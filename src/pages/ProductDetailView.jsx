import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./styles/ProductDetailView.css";

export default function ProductDetailView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [message, setMessage] = useState("");

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
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err.response || err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>상품 불러오는 중...</p>;

  const handleSaveToEstimate = async () => {
    try {
      const res = await api.post("/estimate/products/save", {
        productId: product.id, // 🔹 상품 ID
        category: product.type, // 🔹 카테고리 (CPU, GPU 등)
        quantity: 1, // 🔹 기본 수량
      });

      setMessage("견적 보관함에 저장했어요!");
      console.log("✅ 저장 성공:", res.data);
    } catch (err) {
      console.error("❌ 저장 실패:", err.response || err);
      setMessage("저장에 실패했어요. 다시 시도해주세요.");
    }
  };

  const handleCardClick = (build) => {
    setSelectedBuild((prev) => (prev === build ? null : build));
  };

  return (
    <div className="product-detail-view">
      {/* 왼쪽 408px */}
      <div></div>

      {/* 중앙 콘텐츠 */}
      <div className="product-content">
        <div className="breadcrumb">PC 부품 정보 &gt; {product.type}</div>
        <h2 className="product-title">{product.name}</h2>

        <div className="tags">
          <span>#{product.manufacturer}</span>
          <span>#{product.type}</span>
          <span>등록일: {product.reg_date}</span>
        </div>

        {/* 상세 스펙 */}
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
                    {(() => {
                      const entries = [
                        ["manufacturer", product.manufacturer],
                        ...Object.entries(product.options || {}),
                      ];
                      const half = Math.ceil(entries.length / 2);
                      const left = entries.slice(0, half);
                      const right = entries.slice(half);
                      return left.map(([key, value], idx) => (
                        <tr key={key}>
                          <td>{optionLabels[key] || key}</td>
                          <td>{String(value)}</td>
                          {right[idx] ? (
                            <>
                              <td>
                                {optionLabels[right[idx][0]] || right[idx][0]}
                              </td>
                              <td>{String(right[idx][1])}</td>
                            </>
                          ) : (
                            <>
                              <td></td>
                              <td></td>
                            </>
                          )}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 최저가 */}
          <div className="price-box">
            <span className="price-label">최저가</span>
            <strong className="price-value">
              {product.lowestPrice?.price ? (
                <>
                  <span className="price-number">
                    {product.lowestPrice.price.toLocaleString()}
                  </span>
                  <span className="price-unit"> 원</span>
                </>
              ) : (
                "정보 없음"
              )}
            </strong>

            {/* 버튼 */}
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

            {message && <p className="save-message">{message}</p>}
          </div>
        </div>

        {/* 추천 섹션 */}
        <div className="recommend-section">
          <div className="recommend-overlay-text">
            <h3>스펙메이트의 용도별 조합 추천!</h3>
            <p>박스를 클릭해보세요!</p>
          </div>

          <div className="recommend-cards">
            {/* 좌측 */}
            <div>
              {selectedBuild === "office" ? (
                <div className="build-list fixed-slot">
                  <h4>사무용 PC 추천 부품</h4>
                  <ul>
                    {[
                      { category: "CPU", part: "Intel i5-13400" },
                      { category: "메인보드", part: "MSI B760M Pro" },
                      {
                        category: "그래픽카드",
                        part: "내장그래픽 (Intel UHD)",
                      },
                      { category: "메모리", part: "DDR5 16GB 4800MHz" },
                      { category: "파워", part: "마이크로닉스 600W Bronze" },
                      { category: "SSD", part: "삼성 970 EVO Plus 500GB" },
                      { category: "쿨러", part: "기본 쿨러" },
                      { category: "케이스", part: "ABKO Suitmaster" },
                    ].map((b, idx) => (
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

            {/* 우측 */}
            <div>
              {selectedBuild === "gaming" ? (
                <div className="build-list fixed-slot">
                  <h4>게이밍 PC 추천 부품</h4>
                  <ul>
                    {[
                      { category: "CPU", part: "AMD Ryzen 7 9800X3D" },
                      { category: "메인보드", part: "ASUS ROG STRIX B650" },
                      { category: "그래픽카드", part: "RTX 4070 Ti Super" },
                      { category: "메모리", part: "DDR5 32GB 6000MHz" },
                      { category: "파워", part: "시소닉 850W Gold" },
                      { category: "SSD", part: "삼성 990 Pro 1TB" },
                      { category: "쿨러", part: "NZXT Kraken 240" },
                      { category: "케이스", part: "Lian Li Lancool III" },
                    ].map((b, idx) => (
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

      {/* 오른쪽 408px */}
      <div></div>
    </div>
  );
}
