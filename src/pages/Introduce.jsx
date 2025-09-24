import { useEffect, useState } from "react";
import { useHeaderStore } from "../store/headerStore";
import "./styles/Introduce.css";
import serviceImage from "/introduce_service.svg"; // ✅ 서비스 소개 이미지
import intro from "/quote.svg";

export default function Introduce() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black");
  }, []);

  const messages = [
    "나만의 컴퓨터를 조금 더 쉽게 맞추고 싶어요.",
    "부품별로 최적의 PC가 뭔지 알고 싶어요.",
    "지금 사도 오래 쓸 수 있는 PC 구성을 원해요.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="introduce-page">
      {/* ✅ 이미지 + 메시지 오버레이 + 하단 텍스트 */}
      <div className="image-container">
        <div className="message-overlay">
          <div className="quote-mark">
            <img src={intro} alt="서비스 소개 이미지" className="quote-image" />
          </div>
          <p className="introduce-message">{messages[currentIndex]}</p>
          <div className="dots">
            {messages.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentIndex ? "active" : ""}`}
              ></span>
            ))}
          </div>
        </div>

        <div className="bottom-section">
          <p className="subtitle">
            본인만의 맞춤형 PC를 맞추고 싶었던 여러분을 위한 서비스,
          </p>
          <h2 className="title">
            <span className="highlight">스펙메이트</span>를 소개합니다
          </h2>
        </div>
      </div>

      {/* ✅ 이미지 밖 밑부분 텍스트 */}
      <div className="feature-section">
        <h3 className="feature-title">
          필요에 따라 딱 맞는
          <br /> 맞춤형 PC 제안
        </h3>
        <p className="feature-desc">
          수많은 CPU, 그래픽카드, 메모리 옵션까지 <br />
          복잡한 부품 선택을 한 번에, 스펙메이트와 함께하세요.
        </p>
      </div>

      {/* ✅ introduce_service.svg 추가 */}
      <div className="service-image-container">
        <img
          src={serviceImage}
          alt="서비스 소개 이미지"
          className="service-image"
        />
      </div>
    </div>
  );
}
