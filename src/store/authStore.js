import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      // 1. 상태 (State)
      isLoggedIn: false,
      accessToken: null,
      user: null, // 예: { id: 1, email: "user@test.com", nickname: "스펙메이트" }

      // 2. 액션 (Actions)
      // 로그인 시 호출할 액션
      setLogin: (token, userData) =>
        set({
          isLoggedIn: true,
          accessToken: token,
          user: userData,
        }),

      // 로그아웃 시 호출할 액션
      setLogout: () =>
        set({
          isLoggedIn: false,
          accessToken: null,
          user: null,
        }),

      // (선택) 사용자 정보만 업데이트할 경우 (예: 프로필 수정)
      setUser: (newUserData) =>
        set((state) => ({
          ...state,
          user: { ...state.user, ...newUserData },
        })),
    }),
    {
      // 3. Persist 설정
      name: "auth-store", // localStorage에 저장될 때 사용될 키 이름
      storage: createJSONStorage(() => localStorage), // (선택사항) 기본값이 localStorage입니다.
    },
  ),
);
