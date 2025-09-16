import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logoWhite from "/logo.svg";
import logoBlue from "/blue-logo.svg";
import Toast from "../components/Toast";

import "./Header.css";
import { useHeaderStore } from "../store/headerStore";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ 로그인 상태
  const headerVersion = useHeaderStore((state) => state.headerVersion);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 마운트 시 localStorage 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);

    setShowToast(true); // ✅ 토스트 띄우기
    setTimeout(() => {
      navigate("/"); // 2초 뒤 홈으로 이동
    }, 2000);
  };

  const currentLogo = headerVersion === "black" ? logoBlue : logoWhite;

  return (
    <header
      className={`header ${
        headerVersion === "black" ? "header-black" : "header-white"
      }`}
    >
      <div className="header-container">
        {/* 로고 */}
        <div className="logo">
          <Link to="/" aria-label="홈으로 이동">
            <img src={currentLogo} alt="Logo" className="logo-img" />
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="nav">
          <ul>
            <li>
              <NavLink to="/introduce" className="nav-link">
                서비스 소개
              </NavLink>
            </li>
            <li>
              <NavLink to="/usage" className="nav-link">
                스펙메이트 사용
              </NavLink>
            </li>
            <li>
              <NavLink to="/info" className="nav-link">
                PC 부품 정보
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* 로그인 / 로그아웃 + 마이페이지 */}
        <div className="login-btn">
          {isLoggedIn ? (
            <>
              <Link to="/mypage" className="mypage-link">
                마이페이지
              </Link>
              <button onClick={handleLogout} className="logout-link">
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="login-link">
              로그인
            </Link>
          )}
        </div>

        {/* 햄버거 */}
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
              <NavLink
                to="/introduce"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                서비스 소개
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/usage"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                스펙메이트 사용
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/info"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                PC 부품 정보
              </NavLink>
            </li>
          </ul>
          <div className="mobile-login">
            {isLoggedIn ? (
              <>
                <Link
                  to="/mypage"
                  className="mypage-link"
                  onClick={() => setOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="logout-link"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="login-link"
                onClick={() => setOpen(false)}
              >
                로그인
              </Link>
            )}
          </div>
          {showToast && (
            <Toast
              message="로그아웃 성공!"
              onClose={() => setShowToast(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
