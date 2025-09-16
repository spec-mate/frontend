import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import "./styles/Register.css";
import binglogo from "/big-logo.svg";
import api from "../api"; // axios 유틸 가져오기

export default function Register() {
  const navigate = useNavigate(); // ✅ 네비게이터 훅 선언

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

  // ✅ 인증번호 전송 API
  const handleSendCode = async () => {
    if (!email.includes("@")) {
      setEmailError("이메일을 정확히 입력해주세요.");
      return;
    }
    setEmailError("");

    try {
      await api.post("/auth/send-code", null, { params: { email } });
      alert("인증번호가 이메일로 발송되었습니다.");
    } catch (err) {
      console.error(err);
      setEmailError("인증번호 발송 실패");
    }
  };

  // ✅ 인증번호 확인 API
  const handleVerifyCode = async () => {
    try {
      await api.post("/auth/verify-code", null, {
        params: { email, code: verificationCode.trim() }, // ✅ trim()으로 공백 제거
      });
      alert("이메일 인증 성공!");
      setCodeError("");
    } catch (err) {
      console.error(err);
      setCodeError("인증번호가 올바르지 않거나 만료되었습니다.");
    }
  };

  // ✅ 비밀번호 입력 시 실시간 검사
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

  // ✅ 최종 회원가입 API
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordError) {
      alert("비밀번호 형식이 올바르지 않습니다.");
      return;
    }

    try {
      const res = await api.post("/auth/signup", {
        nickname,
        email,
        password,
      });
      console.log("회원가입 성공:", res.data);
      alert("회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.");

      // ✅ 로그인 페이지로 이동
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(
        "회원가입 실패: " + (err.response?.data?.message || "알 수 없는 오류")
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
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

          {/* 닉네임 */}
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
            </div>
            {emailError && <p className="error-text">{emailError}</p>}
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
            {codeError && <p className="error-text">{codeError}</p>}
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
            {passwordError && <p className="error-text">{passwordError}</p>}
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
          </div>

          <button type="submit" className="register-button">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
