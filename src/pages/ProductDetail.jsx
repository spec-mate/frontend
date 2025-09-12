import React from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: "40px" }}>
      <h2>{id.toUpperCase()} 상세 페이지</h2>
      <p>여기에 {id}의 스펙과 설명을 불러와 보여줍니다.</p>
    </div>
  );
}
