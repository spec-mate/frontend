import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Register.css";
import binglogo from "/big-logo.svg";
import api from "../api";
import ErrorMessage from "../components/ErrorMessage";
import Toast from "../components/Toast";

export default function Register() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nicknameError, setNicknameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    if (value === "중복닉네임") {
      setNicknameError("중복된 닉네임입니다.");
    } else {
      setNicknameError("");
    }
  };

  const handleSendCode = async () => {
    if (!email.includes("@")) {
      setEmailError("이메일을 정확히 입력해주세요.");
      return;
    }
    setEmailError("");

    try {
      const res = await api.post("/auth/send-code", { email });
      if (res.status === 200) {
        setToastMessage("인증번호가 이메일로 발송되었습니다.");
        setToastType("success");
        setShowToast(true);
        setTimer(300);
      }
    } catch (err) {
      console.error(err);
      setEmailError("인증번호 발송 실패");

      setToastMessage("인증번호 전송을 실패하였습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await api.post("/auth/verify-code", {
        email,
        code: verificationCode.trim(),
      });

      setToastMessage("이메일 인증 성공!");
      setToastType("success");
      setShowToast(true);
      setCodeError("");
      setTimer(0);
    } catch (err) {
      console.error(err);
      setCodeError("인증번호가 올바르지 않거나 만료되었습니다.");

      setToastMessage("인증번호 확인을 실패하였습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;

    if (value.length === 0) {
      setPasswordError("");
    } else if (!regex.test(value)) {
      setPasswordError(
        "영문, 숫자, 특수문자를 조합해서 입력해주세요. (8~16자)",
      );
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setToastMessage("비밀번호가 일치하지 않습니다.");
      setToastType("error");
      setShowToast(true);
      return;
    }
    if (passwordError) {
      setToastMessage("비밀번호 형식이 올바르지 않습니다.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      await api.post("/auth/signup", {
        nickname,
        email,
        password,
      });

      setToastMessage("회원가입을 성공하였습니다.");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setToastMessage("회원가입을 실패하였습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <Link to="/">
          <img src={binglogo} alt="로고" className="register-logo" />
        </Link>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* 닉네임 */}
          <div className="input-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="스펙메이트"
              required
            />
            <ErrorMessage message={nicknameError || ""} />
          </div>

          {/* 이메일 */}
          <div className="input-group">
            <label htmlFor="email">이메일 주소*</label>
            <div className="input-group-row">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@gmail.com"
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
              {/* ✅ 타이머 고정 위치 */}
              {timer > 0 ? (
                <span className="timer active">{formatTime(timer)}</span>
              ) : (
                <span className="timer"></span>
              )}
            </div>
            <ErrorMessage message={emailError || ""} />
          </div>

          {/* 인증번호 */}
          <div className="input-group">
            <label htmlFor="verification">인증번호 확인*</label>
            <div className="input-group-row">
              <input
                id="verification"
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
            <ErrorMessage message={codeError || ""} />
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호*</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호"
              required
            />
            <ErrorMessage message={passwordError || ""} />
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인*</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 입력(영,숫,특 조합)"
              required
            />
            <ErrorMessage message={""} />
          </div>

          <button type="submit" className="register-button">
            회원가입
          </button>

          <p className="login-text">
            이미 회원이신가요?{" "}
            <Link to="/login" className="login-link">
              로그인하기
            </Link>
          </p>
        </form>
      </div>

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
