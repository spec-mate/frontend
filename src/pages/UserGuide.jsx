import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHeaderStore } from "../store/headerStore";
import "./styles/UserGuide.css";

export default function UserGuideList() {
  const navigate = useNavigate();

  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("black");
  }, []);

  const guides = [
    {
      id: "usage",
      title: "스펙메이트 사용하기",
      desc: "AI가 자동으로 견적을 구성하는 스펙메이트의 핵심 기능을 알아보세요.",
      icon: "/chatbubble.svg",
    },
    {
      id: "custom",
      title: "사용자 견적 추가하기",
      desc: "직접 선택한 부품을 저장하고 나만의 견적을 구성하는 방법입니다.",
      icon: "/Document.svg", // ✅ 영수증 이미지로 교체
      hasFloatEffect: true, // ✅ 둥둥 효과 적용
    },
    {
      id: "mypage",
      title: "마이페이지에서 견적 관리하기",
      desc: "AI 추천 견적과 직접 만든 견적을 한눈에 관리할 수 있습니다.",
      icon: "/user.svg",
    },
  ];

  return (
    <div className="guide-container">
      <section className="guide-header">
        <h1>스펙메이트 이용 가이드</h1>
        <p>각 항목을 클릭하면 자세한 설명 페이지로 이동합니다.</p>
      </section>

      <div className="guide-card-list">
        {guides.map((item) => (
          <div
            key={item.id}
            className={`guide-card-btn ${item.isIntro ? "intro-card" : ""}`}
            onClick={() => !item.isIntro && navigate(`/guide/${item.id}`)}
            style={item.isIntro ? { cursor: "default" } : {}}
          >
            <div
              className={`guide-card-content ${
                item.hasFloatEffect ? "float-active" : ""
              }`}
            >
              <div className="guide-card-text">
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
              </div>

              {item.icon && (
                <div className="guide-card-icon">
                  <img
                    src={item.icon}
                    alt={`${item.title} 아이콘`}
                    className={item.hasFloatEffect ? "receipt-image" : ""}
                  />
                  {item.hasFloatEffect && (
                    <>
                      <span className="float-text text1">CPU</span>
                      <span className="float-text text2">RAM</span>
                      <span className="float-text text3">VGA</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
