// Toast.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Toast.css";
import checkIcon from "/check.svg"; //  성공용
import warningIcon from "/warning.svg"; //  실패/경고용

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // 2초 뒤 자동 닫힘
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === "success" ? checkIcon : warningIcon; //  타입에 따라 아이콘 선택

  return createPortal(
    <div className={`toast-wrapper ${type}`}>
      <div className="toast">
        <img src={icon} alt="아이콘" className="toast-icon" />
        <span>{message}</span>
      </div>
    </div>,
    document.body,
  );
}
