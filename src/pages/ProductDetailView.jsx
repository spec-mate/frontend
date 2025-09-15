import React from "react";
import { useParams } from "react-router-dom";
import "./styles/ProductDetailView.css";

export default function ProductDetailView() {
  const { productName, id } = useParams();

  const dummyProduct = {
    id,
    name: "AMD 라이젠7-6세대 9800X3D (그래니트 릿지)",
    img: "/cpu.svg",
    price: "₩630,830",
    specs: {
      제조회사: "AMD",
      CPU종류: "라이젠7-6세대",
      코어수: "8코어",
      메모리규격: "DDR5",
      기본클럭: "4.7GHz",
      L2캐시: "8MB",
      TDP: "120W",
      메모리클럭: "5600MHz",
      등록년월: "2024년 11월",
      소켓구분: "AMD(소켓AM5)",
      스레드수: "16스레드",
      내장그래픽: "O",
      최대클럭: "5.2GHz",
      L3캐시: "96MB",
      PCIe버전: "PCIe5.0",
    },
  };

  return (
    <div className="product-detail-view">
      <div className="breadcrumb">PC 부품 정보 &gt; {productName}</div>

      <h2 className="product-title">{dummyProduct.name}</h2>

      <div className="tags">
        <span>#AMD</span>
        <span>#라이젠</span>
        <span>#그래니트릿지</span>
      </div>

      {/* ✅ product-box → grid: 왼쪽(이미지+스펙) / 오른쪽(price-box) */}
      <div className="product-box">
        <div className="product-info">
          <div className="left">
            <img
              src={dummyProduct.img}
              alt={dummyProduct.name}
              className="product-detail-image"
            />
          </div>

          <div className="right">
            <div className="specs-tables">
              <table>
                <tbody>
                  <tr>
                    <td>제조회사</td>
                    <td>{dummyProduct.specs.제조회사}</td>
                  </tr>
                  <tr>
                    <td>CPU 종류</td>
                    <td>{dummyProduct.specs.CPU종류}</td>
                  </tr>
                  <tr>
                    <td>코어 수</td>
                    <td>{dummyProduct.specs.코어수}</td>
                  </tr>
                  <tr>
                    <td>메모리 규격</td>
                    <td>{dummyProduct.specs.메모리규격}</td>
                  </tr>
                  <tr>
                    <td>기본 클럭</td>
                    <td>{dummyProduct.specs.기본클럭}</td>
                  </tr>
                  <tr>
                    <td>L2 캐시</td>
                    <td>{dummyProduct.specs.L2캐시}</td>
                  </tr>
                  <tr>
                    <td>TDP</td>
                    <td>{dummyProduct.specs.TDP}</td>
                  </tr>
                  <tr>
                    <td>메모리 클럭</td>
                    <td>{dummyProduct.specs.메모리클럭}</td>
                  </tr>
                </tbody>
              </table>

              <table>
                <tbody>
                  <tr>
                    <td>등록년월</td>
                    <td>{dummyProduct.specs.등록년월}</td>
                  </tr>
                  <tr>
                    <td>소켓 구분</td>
                    <td>{dummyProduct.specs.소켓구분}</td>
                  </tr>
                  <tr>
                    <td>스레드 수</td>
                    <td>{dummyProduct.specs.스레드수}</td>
                  </tr>
                  <tr>
                    <td>내장 그래픽</td>
                    <td>{dummyProduct.specs.내장그래픽}</td>
                  </tr>
                  <tr>
                    <td>최대 클럭</td>
                    <td>{dummyProduct.specs.최대클럭}</td>
                  </tr>
                  <tr>
                    <td>L3 캐시</td>
                    <td>{dummyProduct.specs.L3캐시}</td>
                  </tr>
                  <tr>
                    <td>PCIe 버전</td>
                    <td>{dummyProduct.specs.PCIe버전}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="price-box">
          <span>최저가</span>
          <strong>{dummyProduct.price}</strong>
          <button className="save-btn">보관하기</button>
        </div>
      </div>

      {/* ✅ 추천 섹션 */}
      <div className="recommend-section">
        {/* 오버레이 안내 문구 → 카드 위쪽 빈 공간에 배치 */}
        <div className="recommend-overlay">
          스펙메이트의 용도별 조합 추천! <br />
          박스를 클릭해보세요!
        </div>

        {/* 추천 카드 */}
        <div className="recommend-cards">
          <div className="recommend-card">
            <img src="/gaming.svg" alt="게이밍 PC" />
            <div className="recommend-label">게이밍</div>
            <div className="recommend-desc">
              최신 부품 조합으로 최적의 게임환경을 보장하는 게이밍 PC입니다.
            </div>
          </div>

          <div className="recommend-card">
            <img src="/affairs.svg" alt="사무용 PC" />
            <div className="recommend-label">사무</div>
            <div className="recommend-desc">
              업무와 멀티태스킹에 최적화된 고성능 부품으로 구성된 안정적이고
              조용한 사무용 PC입니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
