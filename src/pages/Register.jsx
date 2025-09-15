import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles/Register.css";
import binglogo from "/big-logo.svg";

export default function Register() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState(
    "영문, 숫자, 특수문자를 조합해서 입력해주세요. (8~16자)"
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
    if (!regex.test(password)) {
      alert("비밀번호 형식이 올바르지 않습니다.");
      return;
    }

    console.log("회원가입 시도:", {
      nickname,
      email,
      verificationCode,
      password,
    });
  };

  const handleSendCode = () => {
    if (!email.includes("@")) {
      setEmailError("이메일을 정확히 입력해주세요.");
    } else {
      setEmailError("");
      console.log("인증번호 전송:", email);
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode !== "1234") {
      setCodeError("인증번호가 올바르지 않습니다.");
    } else {
      setCodeError("");
      console.log("인증번호 확인:", verificationCode);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
    if (!regex.test(value)) {
      setPasswordError(
        "영문, 숫자, 특수문자를 조합해서 입력해주세요. (8~16자)"
      );
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        {/* ✅ 로고를 폼 위에 배치 */}
        <Link to="/">
          <img src={binglogo} alt="로고" className="register-logo" />
        </Link>

        <form className="register-form" onSubmit={handleSubmit}>
          <p className="login-text">
            이미 회원이신가요?{" "}
            <Link to="/login" className="login-link">
              로그인하기
            </Link>
          </p>

          <div className="input-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="스펙메이트"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">이메일 주소*</label>
            <div className="input-group-row">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@gamil.com"
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
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

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
            {codeError && <p className="error-text">{codeError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호*</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호"
              required
            />
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인*</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 입력(영,숫,특 조합)"
              required
            />
          </div>

          <button type="submit" className="register-button">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
