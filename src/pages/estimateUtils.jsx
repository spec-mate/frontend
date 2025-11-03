// src/utils/estimateUtils.js
import api from "../api";

/**
 * 단일 요청으로 부품을 견적 보관함에 추가하는 함수
 * - 기존 견적 생성/중복 검사 등은 백엔드에서 처리
 * - 프론트에서는 제품 id, category, quantity 만 전달
 * @param {object} product - { id, category, name } 필드를 포함해야 함
 */
export const addProductToEstimate = async (product) => {
  if (!product || !product.id || !product.category) {
    console.error("추가할 제품 정보가 올바르지 않습니다:", product);
    return { success: false, message: "제품 정보가 올바르지 않습니다." };
  }

  try {
    // ✅ JWT 토큰 확인
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    // ✅ 단일 API 호출
    const res = await api.post(
      "/estimate/products/save",
      {
        productId: product.id,
        category: product.category,
        quantity: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log("✅ 부품 보관함 추가 성공:", res.data);

    return {
      success: true,
      message: res.data?.message || "부품이 보관함에 추가되었습니다.",
    };
  } catch (error) {
    console.error("❌ 부품 보관함 추가 실패:", error);

    let message = "작업 중 오류가 발생했습니다. 다시 시도해주세요.";
    if (error.response?.status === 403) {
      message = "로그인이 필요합니다.";
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return { success: false, message };
  }
};
