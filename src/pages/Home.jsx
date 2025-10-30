import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useHeaderStore } from "../store/headerStore";
import "./styles/Home.css";

// 이미지 lazy import
import pcImage1 from "/pcimage1.svg";
import pcImage2 from "/pcimage2.svg";
import introduceImage from "/introduceimage.svg";

export default function Home() {
  const navigate = useNavigate();
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  // 헤더 색상 변경 - mount 시 1회만 실행
  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("white");
  }, []);

  // 버튼 클릭 시 이동 (useCallback으로 메모이제이션)
  const handleClick = useCallback(() => {
    navigate("/usage");
  }, [navigate]);

  return (
    <div>
      {/* 첫 번째 섹션 */}
      <section className="home">
        <div className="overlay" />

        <main className="main">
          {/* 텍스트 영역 */}
          <div className="main-text">
            <h1>
              <span className="char-with-dot">컴</span>
              <span className="char-with-dot">알</span>
              <span className="char-with-dot">못</span>도 전문가처럼,
              <br />
              <span>쉽고 빠르게</span>
            </h1>
            <h6>
              복잡한 PC 부품 때문에 난감하셨나요? <br />
              이제는 스펙메이트로 한번에 해결하세요!
            </h6>
            <button className="main-button" onClick={handleClick}>
              시작하기
            </button>
          </div>

          {/* 이미지 영역 */}
          <div className="main-images">
            <img
              src={pcImage1}
              alt="PC Left"
              className="pc-image pc-left"
              loading="lazy"
              decoding="async"
            />
            <img
              src={pcImage2}
              alt="PC Right"
              className="pc-image pc-right"
              loading="lazy"
              decoding="async"
            />
          </div>
        </main>
      </section>

      {/* 두 번째 섹션 */}
      <section className="info-section">
        <div className="info-box">
          <div className="info-left">
            <h2>
              <span style={{ color: "#1E5CDE" }}>스펙메이트</span>란?
            </h2>
            <p>
              스펙메이트는 복잡한 PC 부품 선택에 어려움을 느끼는 분들을 위해
              만들어진 개인화 AI 어시스턴트입니다.
            </p>
            <p>
              원하는 용도와 예산만 알려주세요. 스펙메이트가 성능, 호환성,
              가성비를 모두 고려해 최적의 구성을 제안합니다.
            </p>
          </div>

          <div className="info-right">
            <img
              src={introduceImage}
              alt="Introduce Illustration"
              className="introduce-image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
