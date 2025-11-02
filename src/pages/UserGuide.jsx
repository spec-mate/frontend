import React, { useEffect } from "react";
import "./styles/UserGuide.css";
import { useHeaderStore } from "../store/headerStore";

export default function UserGuide() {
  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("black");
  }, []);

  return (
    <div className="guide-container">
      {/* 헤더 */}
      <section className="guide-header">
        <h1>스펙메이트 이용 가이드</h1>
        <p>
          스펙메이트는 AI가 당신의 용도에 맞는 PC 견적을 자동으로 구성해주는
          서비스입니다.
          <br />
          아래 단계를 차근히 따라 하며, 쉽게 시작해 보세요!
        </p>
      </section>

      {/* 1️⃣ 회원가입 및 로그인 */}
      <section className="guide-section">
        <h2>1️⃣ 회원가입 및 로그인</h2>
        <div className="guide-row">
          <div className="guide-text">
            <p>
              스펙메이트를 사용하려면 먼저 회원가입이 필요합니다.
              <br />단 몇 분이면 완료됩니다!
            </p>
            <ol>
              <li>
                홈페이지 상단의 <strong>“로그인”</strong> 버튼을 클릭합니다.
              </li>
              <li>
                로그인 페이지 하단의 <strong>“회원가입”</strong> 버튼을
                눌러주세요.
              </li>
            </ol>
            <div className="guide-image-side">
              <img src="/gosignup.png" alt="회원가입 하는 법" />
            </div>
            <ol start={3}>
              <li>
                <strong>닉네임, 이메일, 비밀번호</strong>를 입력합니다.
              </li>
              <li>
                <strong>"인증번호 전송"</strong> 버튼을 눌러 받은 인증번호를
                입력하세요.
              </li>
              <li>
                <strong>“회원가입 완료”</strong> 버튼을 누르면 가입이 끝납니다.
              </li>
            </ol>
          </div>
          <div className="guide-image-side">
            <img src="/howtosignup.png" alt="회원가입 예시" />
          </div>
        </div>
      </section>

      {/* 2️⃣ 로그인 */}
      <section className="guide-section">
        <div className="guide-row">
          <div className="guide-text">
            <p>
              회원가입을 완료했다면, 이제 로그인을 통해 내 견적을 관리할 수
              있습니다.
            </p>
            <ol>
              <li>
                상단 메뉴의 <strong>“로그인”</strong> 버튼을 클릭합니다.
              </li>
              <li>
                가입 시 입력한 <strong>이메일과 비밀번호</strong>를 입력한 뒤{" "}
                <strong>“로그인”</strong>을 누르세요.
              </li>
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

      {/* 3️⃣ 스펙메이트 사용 */}
      <section className="guide-section">
        <h2>2️⃣ 스펙메이트 사용</h2>
        <div className="guide-row">
          <div className="guide-text">
            <p>
              로그인 후, AI가 자동으로 견적을 구성해주는{" "}
              <strong>스펙메이트</strong> 기능을 사용할 수 있습니다.
            </p>
            <ol>
              <li>
                상단 메뉴의 <strong>“스펙메이트 사용”</strong>을 클릭합니다.
              </li>
              <li>
                예시를 클릭하거나 채팅창에 원하는 용도를 입력하세요. <br />
                예: “영상 편집용 고성능 PC 맞춰줘”
              </li>
              <div className="guide-image-side">
                <img src="/howtouseuseage.png" alt="스펙메이트 사용 예시" />
              </div>
              <li>AI가 성능과 예산에 맞게 부품을 자동으로 구성해줍니다.</li>
              <li>
                생성된 견적은 <strong>“내 견적 보관함”</strong>에 저장해두고
                다시 볼 수 있습니다.
              </li>
            </ol>
          </div>

          <div className="guide-image-side">
            <img src="/howtousage.png" alt="스펙메이트 사용 예시" />
          </div>
        </div>
      </section>

      {/* 4️⃣ 사용자 견적 추가 방법 */}
      <section className="guide-section">
        <h2>3️⃣ 사용자 견적 추가 방법</h2>
        <div className="guide-row">
          <div className="guide-text">
            <ol>
              <li>
                상단의 <strong>PC 부품 정보</strong> 탭 클릭 후, 원하는 부품을
                선택합니다.
              </li>
              <li>
                부품의 상세페이지로 이동한 뒤 <strong>“보관하기”</strong> 버튼을
                클릭합니다.
              </li>
              <li>
                견적이 <strong>마이페이지</strong>로 이동합니다.
              </li>
              <div className="guide-image-side">
                <img src="/gomypage.png" alt="사용자 견적 보관 예시" />
              </div>
              <li>
                생성된 견적은 <strong>“내 견적 보관함”</strong>에서 다시 확인할
                수 있습니다.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* 5️⃣ 마이페이지 안내 */}
      <section className="guide-section">
        <h2>4️⃣ 마이페이지에서 내 견적 확인하기</h2>
        <div className="guide-row">
          <div className="guide-text">
            <p>
              마이페이지에서는 AI가 자동으로 구성한 견적과
              <br />
              사용자가 직접 추가한 견적을 한눈에 확인할 수 있습니다.
            </p>
            <ol>
              <li>
                상단 메뉴의 <strong>“마이페이지”</strong>를 클릭합니다.
              </li>
              <li>
                <strong>AI 추천 견적</strong>과 <strong>내가 만든 견적</strong>
                이 각각 구분되어 표시됩니다.
              </li>
              <li>
                각 견적을 클릭하면 상세 구성과 부품 목록을 확인할 수 있습니다.
              </li>
              <li>수정 또는 삭제를 통해 내 견적을 관리할 수 있습니다.</li>
            </ol>
          </div>
          <div className="guide-image-side">
            <img src="/mypage.png" alt="마이페이지 예시" />
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="guide-footer">
        <p>© 2025 SpecMate. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
