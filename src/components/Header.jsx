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
  const [toastType, setToastType] = useState("success");
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

  useEffect(() => {
    const checkLogin = () => {
      const token =
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleLogout = async () => {
    try {
      const nickname = localStorage.getItem("nickname") || "유저";

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("email");
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

        {/* ✅ 이용자 가이드 + 로그인 버튼 그룹 */}
        <div className="login-btn">
          <Link to="/guide" className="nav-link guide-link">
            이용자 가이드
          </Link>

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

        {/* 햄버거 버튼 */}
        <button
          className="hamburger"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          ☰
        </button>
      </div>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <div
          className={`mobile-menu-container ${
            headerVersion === "black" ? "mobile-black" : "mobile-white"
          }`}
        >
          <ul>
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
            <li>
              <NavLink
                to="/guide"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                이용자 가이드
              </NavLink>
            </li>
          </ul>

          <div className="mobile-login">
            {isLoggedIn ? (
              <>
                <Link
                  to="/mypage"
                  className="glass-btn"
                  onClick={() => setOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="glass-btn"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="glass-btn"
                onClick={() => setOpen(false)}
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>

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
