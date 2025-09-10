import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import binglogo from "/big-logo.svg";

export default function Register() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    console.log("회원가입 시도:", {
      nickname,
      email,
      verificationCode,
      password,
    });
    // 실제 회원가입 API 호출
  };

  const handleSendCode = () => {
    console.log("인증번호 전송:", email);
    // 이메일 인증번호 전송 API 호출
  };

  const handleVerifyCode = () => {
    console.log("인증번호 확인:", verificationCode);
    // 인증번호 확인 API 호출
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        {/* 로고 - 클릭 시 홈으로 이동 */}
        <Link to="/">
          <img src={binglogo} alt="로고" className="register-logo" />
        </Link>
        {/* 로그인 안내 */}
        <p className="login-text">
          이미 회원이신가요?{" "}
          <Link to="/login" className="login-link">
            로그인하기
          </Link>
        </p>
        {/* 닉네임 */}
        <div className="input-group">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            required
          />
        </div>

        {/* 이메일 + 인증번호 전송 버튼 */}
        <div className="input-group-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            required
          />
          <button
            type="button"
            className="small-button"
            onClick={handleSendCode}
          >
            인증번호 <br />
            전송
          </button>
        </div>

        {/* 인증번호 + 확인 버튼 */}
        <div className="input-group-row">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호 입력"
            required
          />
          <button
            type="button"
            className="small-button"
            onClick={handleVerifyCode}
          >
            인증번호 <br />
            확인
          </button>
        </div>

        {/* 비밀번호 */}
        <div className="input-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
          />
        </div>

        {/* 비밀번호 확인 */}
        <div className="input-group">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 확인"
            required
          />
        </div>

        {/* 회원가입 버튼 */}
        <button type="submit" className="register-button">
          회원가입
        </button>
      </form>
    </div>
  );
}
