import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useHeaderStore } from "../store/headerStore";
import "./styles/UserGuide.css";

export default function UserGuideDetail() {
  const { id } = useParams();

  useEffect(() => {
    useHeaderStore.getState().setHeaderVersion("black");
  }, []);

  const guideData = {
    usage: {
      title: "스펙메이트 사용하기",
      image: "/howtousage.png",
      steps: [
        "상단 메뉴의 ‘스펙메이트 사용’을 클릭합니다.",
        "원하는 용도나 예산을 입력하면 AI가 자동으로 견적을 구성합니다.",
        "구성된 견적은 보관함에 저장하거나 수정할 수 있습니다.",
      ],
    },
    custom: {
      title: "사용자 견적 추가하기",
      image: "/gomypage.png",
      steps: [
        "‘PC 부품 정보’에서 원하는 부품을 선택합니다.",
        "부품 상세 페이지에서 ‘보관하기’ 버튼을 누릅니다.",
        "‘마이페이지 > 내 견적 보관함’에서 저장된 견적을 확인하세요.",
      ],
    },
    mypage: {
      title: "마이페이지에서 견적 관리하기",
      image: "/mypage.png",
      steps: [
        "상단 메뉴에서 마이페이지로 이동합니다.",
        "AI 추천 견적과 직접 만든 견적을 구분하여 확인할 수 있습니다.",
        "각 견적을 클릭해 상세 구성, 수정, 삭제를 진행할 수 있습니다.",
      ],
    },
  };

  const guide = guideData[id];

  if (!guide) {
    return (
      <div className="guide-container">
        <h2>존재하지 않는 가이드입니다.</h2>
        <Link to="/guide">← 가이드 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="guide-detail-container">
      <Link to="/guide" className="back-link">
        ← 전체 가이드로 돌아가기
      </Link>

      <h1>{guide.title}</h1>

      {/* ✅ 설명 먼저 */}
      <ol className="guide-detail-steps">
        {guide.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      {/* ✅ 이미지 아래로 이동 */}
      <img src={guide.image} alt={guide.title} className="guide-detail-img" />
    </div>
  );
}
