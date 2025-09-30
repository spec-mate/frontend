import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import binglogo from "/big-logo.svg";
import api from "../api";
import Toast from "../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ sessionStorage 에 저장 (브라우저 닫으면 삭제)
      sessionStorage.setItem("accessToken", res.data.accessToken);
      sessionStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("nickname", res.data.nickname || "유저");
      sessionStorage.setItem("email", res.data.email);

      const userNickname = res.data.nickname || "유저";
      setNickname(userNickname);

      setToastMessage(`반가워요 ${userNickname}님!`);
      setToastType("success");
      setShowToast(true);

      // 2초 후 홈으로 이동
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("로그인 실패:", err);
      const message =
        err.response?.data?.message || "이메일 또는 비밀번호를 확인해주세요.";
      setToastMessage(message);
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <div className="login-container">
      <Link to="/">
        <img src={binglogo} alt="로고" className="login-logo" />
      </Link>

      <form className="login-form" onSubmit={handleSubmit}>
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

        <p className="signup-text">
          회원이 아니신가요?{" "}
          <Link to="/register" className="signup-link">
            회원가입하기
          </Link>
        </p>

        <div className="forgot-password">
          <Link to="/forgot-password" className="forgot-link">
            비밀번호 찾기
          </Link>
        </div>
      </form>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
