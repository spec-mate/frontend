import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles/Login.css";
import binglogo from "/big-logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("로그인 시도:", { email, password });
  };

  return (
    <div className="login-container">
      {/* ✅ 로고를 폼 밖 위로 이동 */}
      <Link to="/">
        <img src={binglogo} alt="로고" className="login-logo" />
      </Link>

      <form className="login-form" onSubmit={handleSubmit}>
        <p className="signup-text">
          회원이 아니신가요?{" "}
          <Link to="/register" className="signup-link">
            회원가입하기
          </Link>
        </p>

        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
          />
        </div>

        <button type="submit" className="login-button">
          로그인
        </button>

        <div className="forgot-password">
          <Link to="/forgot-password" className="forgot-link">
            비밀번호 찾기
          </Link>
        </div>
      </form>
    </div>
  );
}
