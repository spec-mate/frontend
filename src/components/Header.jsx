// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "/logo.svg";
import "./Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* 로고 */}
        <div className="logo">
          <Link to="/" aria-label="홈으로 이동">
            <img src={logo} alt="Logo" className="logo-img" />
          </Link>
        </div>

        {/* 네비게이션 (데스크탑) */}
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">서비스 소개</Link>
            </li>
            <li>
              <Link to="/specmate">스펙메이트 사용</Link>
            </li>
            <li>
              <Link to="/info">PC 부품 정보</Link>
            </li>
          </ul>
        </nav>

        {/* 로그인 버튼 (데스크탑) */}
        <div className="login-btn">
          <Link to="/login">로그인</Link>
        </div>

        {/* 햄버거 버튼 (모바일) */}
        <button
          type="button"
          className="hamburger"
          onClick={() => setOpen(!open)}
        >
          {!open ? (
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div className="mobile-menu-container">
          <ul>
            <li>
              <Link to="/" onClick={() => setOpen(false)}>
                서비스 소개
              </Link>
            </li>
            <li>
              <Link to="/specmate" onClick={() => setOpen(false)}>
                스펙메이트 사용
              </Link>
            </li>
            <li>
              <Link to="/info" onClick={() => setOpen(false)}>
                PC 부품 정보
              </Link>
            </li>
            <li>
              <Link to="/customer-support" onClick={() => setOpen(false)}>
                고객센터
              </Link>
            </li>
          </ul>
          <div className="mobile-login">
            <Link to="/login" onClick={() => setOpen(false)}>
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
