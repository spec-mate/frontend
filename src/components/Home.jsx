// src/pages/Home.jsx
import React from "react";
import Header from "./components/Header";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      {/* 어두운 오버레이 */}
      <div className="overlay"></div>

      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="main">
        <div className="main-text">
          <h1>
            컴알못도 전문가처럼,
            <span>쉽고 빠르게</span>
          </h1>
          <h6>
            복잡한 PC 부품과 설명 때문에 난감하셨나요? <br />
            이제는 스펙메이트로 한번에 해결하세요!
          </h6>
        </div>

        {/* 푸터 */}
        <footer className="footer">
          <a href="/" className="footer-link">
            Footer Link
          </a>
        </footer>
      </main>
    </div>
  );
}
