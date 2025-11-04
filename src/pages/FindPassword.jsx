import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css"; // 로그인 스타일 재사용
import binglogo from "/big-logo.svg";
import api from "../api";
import Toast from "../components/Toast";

export default function FindPassword() {
  const [email, setEmail] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // ✅ 비밀번호 찾기 이메일 코드 발송 요청
      const res = await api.post("/auth/password/send-code", { email });

      setToastMessage(
        res.data?.message ||
          "입력하신 이메일로 비밀번호 재설정 코드를 전송했습니다.",
      );
      setToastType("success");
      setShowToast(true);

      // ✅ 잠시 후 비밀번호 재설정 페이지로 이동
      setTimeout(() => {
        navigate("/reset-password", { state: { email } }); // ✅ 이메일 정보 전달
      }, 1500);
    } catch (err) {
      console.error("비밀번호 찾기 실패:", err);
      setToastMessage(
        err.response?.data?.message || "등록된 이메일을 다시 확인해주세요.",
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
        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        <button type="submit" className="login-button">
          비밀번호 찾기
        </button>

        {/* 회원가입 안내 */}
        <p className="signup-text">
          회원이 아니신가요?{" "}
          <Link to="/register" className="signup-link">
            회원가입하기
          </Link>
        </p>

        {/* 로그인으로 돌아가기 */}
        <p className="forgot-text">
          <Link to="/login" className="forgot-link">
            로그인하기
          </Link>
        </p>
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
