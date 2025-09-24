// Header.jsx

import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import logoWhite from "/logo.svg";
import logoBlue from "/blue-logo.svg";
import Toast from "../components/Toast";

import "./Header.css";
import { useHeaderStore } from "../store/headerStore";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // ✅ success | error
  const headerVersion = useHeaderStore((state) => state.headerVersion);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ 로그인 상태 감지 (localStorage / sessionStorage 변경 감지)
  useEffect(() => {
    const checkLogin = () => {
      const token =
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    checkLogin(); // 첫 실행
    window.addEventListener("storage", checkLogin); // storage 변경 감지
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleLogout = async () => {
    try {
      const nickname = localStorage.getItem("nickname") || "유저";

      // 필요하다면 서버 로그아웃 API 호출
      // await api.post("/auth/logout");

      // ✅ 세션스토리지 클리어
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("email");

      // ✅ 로컬스토리지 클리어
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("nickname");
      localStorage.removeItem("email");

      setIsLoggedIn(false);

      setToastMessage(`${nickname}님, 다음에 또 오세요!`);
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("로그아웃 실패:", err);

      setToastMessage("로그아웃을 실패했어요...");
      setToastType("error");
      setShowToast(true);
    }
  };

  const currentLogo = headerVersion === "black" ? logoBlue : logoWhite;
  const isMainPage = location.pathname === "/";

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
              <Link
                to="/mypage"
                className={isMainPage ? "glass-btn" : "mypage-link"}
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className={isMainPage ? "glass-btn" : "logout-link"}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={isMainPage ? "glass-btn" : "login-link"}
            >
              로그인
            </Link>
          )}
        </div>
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
                  className={isMainPage ? "glass-btn" : "mypage-link"}
                  onClick={() => setOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className={isMainPage ? "glass-btn" : "logout-link"}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={isMainPage ? "glass-btn" : "login-link"}
                onClick={() => setOpen(false)}
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 토스트 메시지 */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </header>
  );
}
