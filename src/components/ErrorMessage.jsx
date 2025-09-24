import React from "react";

export default function ErrorMessage({ message }) {
  return (
    <p className="error-text">{message || "　"}</p>
    // 에러가 없으면 전각 공백으로 자리 유지
  );
}
