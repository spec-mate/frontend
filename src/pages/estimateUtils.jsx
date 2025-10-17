// src/utils/estimateUtils.js
import api from "../api";

/**
 * 특정 제품을 사용자의 견적에 추가하는 함수.
 * 1. 사용자의 모든 견적을 불러옵니다.
 * 2. 추가하려는 부품과 같은 카테고리의 부품이 없는 견적을 찾습니다.
 * 3. 만약 모든 견적에 해당 카테고리의 부품이 이미 있다면, 새로운 견적을 생성합니다.
 * 4. 찾았거나 새로 생성한 견적에 해당 부품을 추가합니다.
 * @param {object} product - 추가할 제품 객체 (id, category, name 등이 포함되어야 함)
 * @returns {object} - 작업 성공 여부와 메시지를 담은 객체
 */
export const addProductToEstimate = async (product) => {
  if (!product || !product.id || !product.category) {
    console.error("추가할 제품 정보가 올바르지 않습니다.");
    return { success: false, message: "제품 정보가 올바르지 않습니다." };
  }

  try {
    // 1. 현재 사용자의 모든 견적 목록을 가져옵니다.
    const estimatesRes = await api.get("/estimate/me");
    const estimates = estimatesRes.data;

    let targetEstimateId = null;

    // 2. 부품을 추가할 기존 견적이 있는지 확인합니다. (카테고리 중복 방지)
    for (const estimate of estimates) {
      const productsRes = await api.get(`/estimate/${estimate.id}/products`);
      const existingProducts = productsRes.data;
      const hasConflict = existingProducts.some(
        (p) => p.category === product.category,
      );

      if (!hasConflict) {
        targetEstimateId = estimate.id; // 중복되지 않는 견적을 찾았으므로 사용
        break;
      }
    }

    // 3. 적절한 기존 견적이 없으면 새로운 견적을 생성합니다.
    if (!targetEstimateId) {
      const newEstimateRes = await api.post("/estimate", {
        title: `내 견적 ${estimates.length + 1}`, // 기본 제목 설정
      });
      targetEstimateId = newEstimateRes.data.id;
      console.log("새로운 견적이 생성되었습니다:", newEstimateRes.data);
    }

    // 4. 대상 견적에 새로운 부품을 추가합니다.
    await api.post(`/estimate/${targetEstimateId}/products`, {
      productId: product.id,
      category: product.category,
      quantity: 1,
    });

    console.log(
      `제품 ID:${product.id}이(가) 견적 ID:${targetEstimateId}에 추가되었습니다.`,
    );
    return { success: true, message: "부품이 보관함에 추가되었습니다." };
  } catch (error) {
    console.error("견적에 부품 추가 실패:", error);
    let message = "작업에 실패했습니다. 다시 시도해주세요.";
    if (error.response && error.response.status === 403) {
      message = "로그인이 필요합니다.";
    }
    return { success: false, message };
  }
};
