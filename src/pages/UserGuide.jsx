import React, { useEffect } from "react";
import "./styles/UserGuide.css";
import { useHeaderStore } from "../store/headerStore";

export default function UserGuide() {
  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("black");
  }, []);

  return (
    <div className="guide-container">
      <section className="guide-header">
        <h1>스펙메이트 이용 가이드</h1>
        <p>회원가입부터 AI 견적 추천까지, 단계별로 따라해 보세요.</p>
      </section>

      {/* 1️⃣ 회원가입 방법 */}
      <section className="guide-section">
        <h2>1️⃣ 회원가입 방법</h2>
        <div className="guide-row">
          <div className="guide-text">
            <p>
              스펙메이트를 사용하기 위해서는 먼저 회원가입이 필요합니다.
              <br />
              아래 단계를 순서대로 따라 해주세요.
            </p>
            <ol>
              <li>
                홈페이지 상단의 <strong>“로그인”</strong> 버튼을 클릭합니다.
              </li>
              <li>
                로그인 페이지 하단의 <strong>"회원가입"</strong>버튼을
                클릭합니다
              </li>
              <li>닉네임, 이메일, 비밀번호를 입력합니다.</li>
              <li>
                <strong>인증번호 전송</strong> 버튼을 눌러 이메일로 받은
                인증번호를 입력합니다.
              </li>
              <li>비밀번호를 확인 후 “회원가입” 버튼을 누르면 완료됩니다.</li>
            </ol>
          </div>
          <div className="guide-image-side">
            <img src="/howtosignup.png" alt="회원가입 절차 예시" />
          </div>
        </div>
      </section>

      {/* 2️⃣ 로그인 방법 */}
      <section className="guide-section">
        <h2>2️⃣ 로그인 방법</h2>
        <div className="guide-row">
          <div className="guide-text">
            <p>
              회원가입이 완료되면 로그인 페이지에서 등록한 이메일과 비밀번호로
              로그인할 수 있습니다.
            </p>
            <ol>
              <li>
                상단 메뉴에서 <strong>“로그인”</strong>을 클릭합니다.
              </li>
              <li>이메일과 비밀번호를 입력하고 “로그인” 버튼을 누릅니다.</li>
              <li>
                로그인 후에는 상단 메뉴에서 <strong>“마이페이지”</strong>로
                이동할 수 있습니다.
              </li>
            </ol>
          </div>
          <div className="guide-image-side">
            <img src="/howtologin.png" alt="로그인 절차 예시" />
          </div>
        </div>
      </section>

      {/* 3️⃣ 스펙메이트 사용 방법 */}
      <section className="guide-section">
        <h2>3️⃣ 스펙메이트 사용 방법</h2>
        <div className="guide-row">
          <div className="guide-text">
            <p>
              로그인 후 AI가 자동으로 견적을 구성해주는{" "}
              <strong>스펙메이트 사용</strong> 기능을 이용할 수 있습니다.
            </p>
            <ol>
              <li>
                상단 메뉴의 <strong>“스펙메이트 사용”</strong> 버튼을
                클릭합니다.
              </li>
              <li>
                채팅창에 원하는 용도를 입력합니다.
                <br />
                예: “화이트 컨셉으로 pc 맞춰줘”
              </li>
              <li>AI가 자동으로 부품을 분석하여 견적을 제시합니다.</li>
              <li>
                마음에 드는 견적은 <strong>“내 견적 보관함”</strong>에 저장할 수
                있습니다.
              </li>
            </ol>
          </div>
          <div className="guide-image-side">
            <img src="/howtousage.png" alt="스펙메이트 사용 예시" />
          </div>
        </div>
      </section>

      {/* 5️⃣ 주의사항 */}
      <section className="guide-section">
        <h2>4️⃣ 주의사항</h2>
        <ul>
          <li>견적 가격은 실시간으로 변동될 수 있습니다.</li>
          <li>
            AI 추천은 참고용이며, 실제 구매 전 부품 호환성을 반드시 확인하세요.
          </li>
          <li>입력이 구체적일수록 정확한 견적이 생성됩니다.</li>
        </ul>
      </section>

      <footer className="guide-footer">
        <p>© 2025 SpecMate. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
