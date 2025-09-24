import React, { useEffect } from "react";
import "./styles/Home.css";
import { useHeaderStore } from "../store/headerStore";
import { useNavigate } from "react-router-dom";

import pcImage1 from "/pcimage1.svg";
import pcImage2 from "/pcimage2.svg";

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

          {/* 오른쪽 다이어그램 */}
          <div className="info-right">
            {/* 중앙 박스 */}
            <div className="center-box">스펙메이트</div>

            {/* 연결선 */}
            <svg className="diagram-lines" viewBox="0 0 500 500">
              {/* 중앙 박스 기준점 (250,250)에서 각 기능 박스로 선 */}
              <line
                x1="250"
                y1="250"
                x2="250"
                y2="50"
                stroke="#1e5cde"
                strokeWidth="2"
              />
              <line
                x1="250"
                y1="250"
                x2="420"
                y2="120"
                stroke="#1e5cde"
                strokeWidth="2"
              />
              <line
                x1="250"
                y1="250"
                x2="440"
                y2="250"
                stroke="#1e5cde"
                strokeWidth="2"
              />
              <line
                x1="250"
                y1="250"
                x2="420"
                y2="380"
                stroke="#1e5cde"
                strokeWidth="2"
              />
              <line
                x1="250"
                y1="250"
                x2="250"
                y2="460"
                stroke="#1e5cde"
                strokeWidth="2"
              />
            </svg>

            {/* 기능 아이템 */}
            <div className="circle-item top">
              요구사항 판단
              <br />
              <span>Requirements analysis</span>
            </div>
            <div className="circle-item upper-right">
              부품 검색
              <br />
              <span>Parts search</span>
            </div>
            <div className="circle-item middle-right">
              호환성 체크
              <br />
              <span>Compatibility check</span>
            </div>
            <div className="circle-item lower-right">
              PC 조합 제공
              <br />
              <span>Agent PC build service</span>
            </div>
            <div className="circle-item bottom">
              공유 및 다운로드
              <br />
              <span>Share & Download</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
