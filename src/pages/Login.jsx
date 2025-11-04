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
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      const {
        accessToken,
        refreshToken,
        nickname,
        email: userEmail,
      } = res.data;

      if (!accessToken || !refreshToken)
        throw new Error("토큰이 응답에 포함되지 않았습니다.");

      // ✅ 세션 + 로컬 동시 저장
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // ✅ 유저 정보
      localStorage.setItem("nickname", nickname || "유저");
      sessionStorage.setItem("email", userEmail);

      setToastMessage(`반가워요 ${nickname || "유저"}님!`);
      setToastType("success");
      setShowToast(true);

      // ✅ 2초 후 홈으로 이동
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("로그인 실패:", err);
      setToastMessage(
        err.response?.data?.message || "이메일 또는 비밀번호를 확인해주세요.",
      );
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
        {/* 이메일 입력 */}
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

        {/* 비밀번호 입력 */}
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

        {/* 로그인 버튼 */}
        <button type="submit" className="login-button">
          로그인
        </button>

        {/* 회원가입 안내 */}
        <p className="signup-text">
          회원이 아니신가요?{" "}
          <Link to="/register" className="signup-link">
            회원가입하기
          </Link>
        </p>

        {/* ✅ 추가된 비밀번호 찾기 링크 */}
        <p className="forgot-text">
          <Link to="/findpassword" className="forgot-link">
            비밀번호 찾기
          </Link>
        </p>
      </form>

      {/* Toast 알림 */}
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
