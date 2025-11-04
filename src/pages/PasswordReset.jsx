import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Register.css"; // 기존 회원가입 스타일 재사용
import binglogo from "/big-logo.svg";
import api from "../api";
import ErrorMessage from "../components/ErrorMessage";
import Toast from "../components/Toast";

export default function PasswordReset() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isVerified, setIsVerified] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [timer, setTimer] = useState(0);

  // ✅ 타이머 동작
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ✅ 인증번호 전송
  const handleSendCode = async () => {
    if (!email.includes("@")) {
      setEmailError("이메일을 정확히 입력해주세요.");
      return;
    }
    setEmailError("");

    try {
      const res = await api.post("/auth/password/send-code", { email });
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

  // ✅ 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await api.post("/auth/verify-code", {
        email,
        code: verificationCode.trim(),
      });

      setIsVerified(true);
      setCodeError("");
      setTimer(0);

      setToastMessage("이메일 인증 성공!");
      setToastType("success");
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setCodeError("인증번호가 올바르지 않거나 만료되었습니다.");

      setToastMessage("인증번호 확인을 실패하였습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  // ✅ 비밀번호 입력
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

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

  // ✅ 최종 제출 (비밀번호 변경)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      setToastMessage("이메일 인증을 완료해주세요.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (newPassword !== confirmPassword) {
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
      await api.post("/auth/password/reset", {
        email,
        newPassword,
        confirmPassword,
      });

      setToastMessage("비밀번호가 성공적으로 변경되었습니다.");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setToastMessage(
        err.response?.data?.message || "비밀번호 변경에 실패했습니다.",
      );
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <Link to="/">
          <img src={binglogo} alt="로고" className="register-logo" />
        </Link>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className="input-group">
            <div className="input-group-row">
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
                disabled={isVerified}
              />
              <button
                type="button"
                className="small-button"
                onClick={handleVerifyCode}
                disabled={isVerified}
              >
                인증번호 <br />
                확인
              </button>
            </div>
            <ErrorMessage message={codeError || ""} />
          </div>

          {/* 새 비밀번호 */}
          <div className="input-group">
            <label htmlFor="newPassword">새 비밀번호*</label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              placeholder="비밀번호"
              required
              disabled={!isVerified}
            />
            <ErrorMessage message={passwordError || ""} />
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인*</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 입력(영,숫,특 조합)"
              required
              disabled={!isVerified}
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={!isVerified}
          >
            비밀번호 변경
          </button>

          <p className="login-text">
            로그인 페이지로 돌아가기{" "}
            <Link to="/login" className="login-link">
              로그인하기
            </Link>
          </p>
        </form>
      </div>

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
