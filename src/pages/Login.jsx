import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import binglogo from "/big-logo.svg";
import api from "../api"; // ✅ axios 유틸 가져오기
import Toast from "../components/Toast"; // ✅ 추가

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(false); // ✅ 토스트 표시 여부
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ 토큰 저장
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      setShowToast(true); // ✅ 토스트 띄우기
      console.log("로그인 성공:", res.data);

      // ✅ 로그인 성공 후 페이지 이동 (2초 뒤 이동)
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("로그인 실패:", err);
      alert(
        "로그인 실패: " + (err.response?.data?.message || "알 수 없는 오류")
      );
    }
  };

  return (
    <div className="login-container">
      {/* ✅ 로고 */}
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

      {showToast && (
        <Toast message="로그인 성공!" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
