import React, { useEffect } from "react";
import "./styles/Home.css";
import { useHeaderStore } from "../store/headerStore";
import { useNavigate } from "react-router-dom";

import pcImage1 from "/pcimage1.svg"; // 첫 번째 이미지
import pcImage2 from "/pcimage2.svg"; // 두 번째 이미지
import introduceImage from "/introduceimage.svg";

export default function Home() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);
  const navigate = useNavigate();

  useEffect(() => {
    setHeaderVersion("white");
  }, [setHeaderVersion]);

  const handleClick = () => {
    navigate("/usage");
  };

  return (
    <div>
      {/* 첫 번째 섹션 */}
      <section className="home">
        <div className="overlay"></div>

        <main className="main">
          <div className="main-text">
            <h1>
              <span className="char-with-dot">컴</span>
              <span className="char-with-dot">알</span>
              <span className="char-with-dot">못</span>도 전문가처럼,
              <br />
              <span>쉽고 빠르게</span>
            </h1>
            <h6>
              복잡한 PC 부품과 설명 때문에 난감하셨나요? <br />
              이제는 스펙메이트로 한번에 해결하세요!
            </h6>
            <button className="main-button" onClick={handleClick}>
              시작하기
            </button>
          </div>

          {/* PC 이미지 두 개 */}
          <div className="main-images">
            <img src={pcImage1} alt="PC Image 1" className="pc-image pc-left" />
            <img
              src={pcImage2}
              alt="PC Image 2"
              className="pc-image pc-right"
            />
          </div>
        </main>
      </section>

      {/* 두 번째 섹션 */}
      <section className="info-section">
        <div className="info-box">
          {/* 왼쪽 설명 */}
          <div className="info-left">
            <h2>
              <span style={{ color: "#1E5CDE" }}>스펙메이트</span>란?
            </h2>
            <p>
              스펙메이트는 복잡한 PC 부품 선택에 어려움을 느끼는 분들을 위해
              준비된 개인화된 AI 에이전트입니다.
            </p>
            <p>
              수많은 부품과 스펙을 하나하나 비교할 필요 없이, 원하는 용도와
              예산만 알려주세요.
            </p>
            <p>
              스펙메이트 에이전트는 마치 전문가처럼 당신의 요구를 분석하고,
              성능·호환성·가성비를 종합적으로 고려해 최적의 PC 구성을
              제안합니다.
            </p>
          </div>

          {/* 오른쪽 이미지 */}
          <div className="info-right">
            <img
              src={introduceImage}
              alt="Introduce Illustration"
              className="introduce-image"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
