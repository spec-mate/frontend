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
  const [toastMessage, setToastMessage] = useState(""); // ✅ 토스트 문구 상태
  const [toastType, setToastType] = useState("success"); // ✅ success | error
  const [nickname, setNickname] = useState("");
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

      // ✅ 닉네임 저장
      const userNickname = res.data.nickname || "유저";
      setNickname(userNickname);
      localStorage.setItem("nickname", userNickname);

      setToastMessage(`반가워요 ${userNickname}님!`);
      setToastType("success");
      setShowToast(true);

      console.log("로그인 성공:", res.data);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("로그인 실패:", err);

      setToastMessage("이메일 또는 비밀번호를 확인해주세요."); // ✅ 실패 시 문구
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

      {/* ✅ 성공/실패 공통 토스트 */}
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
