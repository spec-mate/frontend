import React from "react";
import "./styles/MyPage.css";

export default function MyPage() {
  return (
    <div className="mypage">
      <header className="mypage-header">
        <h2>정인호</h2>
        <span className="user-role">스펙메이트 회원</span>
      </header>

      <section className="mypage-section">
        <h3 className="section-title">스펙메이트 보관함 확인하기 &gt;</h3>

        <div className="estimate-block">
          <h4 className="block-title">스펙메이트가 만들어준 견적</h4>
          <div className="estimate-grid">
            <div className="estimate-card">
              <img src="/case.png" alt="견적1" />
            </div>
            <div className="estimate-card">
              <img src="/case.png" alt="견적2" />
            </div>
          </div>
        </div>

        <div className="estimate-block">
          <h4 className="block-title">정인호님이 만든 견적</h4>
          <div className="estimate-grid">
            <div className="estimate-card">
              <img src="/case.png" alt="견적3" />
            </div>
            <div className="estimate-card">
              <img src="/case.png" alt="견적4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
