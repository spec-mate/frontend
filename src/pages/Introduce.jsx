import { useEffect } from "react";
import { useHeaderStore } from "../store/headerStore";
import "./Introduce.css";

export default function Introduce() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);

  useEffect(() => {
    setHeaderVersion("black");
  }, []);

  return (
    <div className="introduce-page">
      <section className="introduce-hero">
        <h1>스펙메이트 소개</h1>
        <p>AI 기반 맞춤형 PC 견적 서비스, 스펙메이트를 만나보세요.</p>
      </section>

      <section className="introduce-content">
        <h2>🚀 주요 기능</h2>
        <ul>
          <li>PC 초보자도 전문가처럼 손쉽게 견적 작성</li>
          <li>최신 부품 정보와 가격을 반영한 스마트 추천</li>
          <li>사용자 맞춤형 옵션 제공 (게임, 사무, 개발 등)</li>
        </ul>

        <h2>💡 스펙메이트의 장점</h2>
        <p>
          복잡한 PC 부품 선택 과정을 단순화하여, 누구나 쉽고 빠르게 자신에게
          맞는 컴퓨터를 구성할 수 있도록 도와드립니다.
        </p>
      </section>
    </div>
  );
}
