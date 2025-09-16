import React, { useEffect } from "react";
import "./styles/Home.css";
import { useHeaderStore } from "../store/headerStore";

export default function Home() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("white");
  }, [setHeaderVersion]);

  return (
    <div className="home">
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
          <button className="main-button">나만의 pc 조립하기</button>
        </div>
      </main>
    </div>
  );
}
