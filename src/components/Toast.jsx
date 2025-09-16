import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Toast.css";
import checkIcon from "/check.svg"; // ✅ 체크 아이콘 (공통)

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // 2초 뒤 자동 닫힘
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className="toast-wrapper">
      <div className="toast">
        <img src={checkIcon} alt="체크" className="toast-icon" />
        <span>{message}</span>
      </div>
    </div>,
    document.body
  );
}
