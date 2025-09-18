import React, { useEffect } from "react";
import "./styles/Home.css";
import { useHeaderStore } from "../store/headerStore";
import { useNavigate } from "react-router-dom"; // ✅ 추가

export default function Home() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);
  const navigate = useNavigate(); // ✅ 라우터 네비게이터 생성

  useEffect(() => {
    setHeaderVersion("white");
  }, [setHeaderVersion]);

  const handleClick = () => {
    navigate("/usage"); // ✅ 클릭 시 /usage 페이지로 이동
  };

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
          <button className="main-button" onClick={handleClick}>
            나만의 PC 조립하기
          </button>
        </div>
      </main>
    </div>
  );
}
