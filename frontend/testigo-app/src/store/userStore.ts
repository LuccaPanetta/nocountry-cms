import { create } from "zustand";

type UserState = {
  idUser: number | null;
  email: string | null;
  username: string | null;
  hasHydrated: boolean;
  accessToken?: string;
};

type UserActions = {
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  idUser: null,
  email: null,
  username: null,
  hasHydrated: false,
  accessToken: undefined,
  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () =>
    set({
      idUser: null,
      email: null,
      username: null,
      hasHydrated: false,
      accessToken: undefined,
    }),
}));
