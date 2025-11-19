import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userSchema, User } from "@/schemas/user";

interface UserState extends Partial<User> {
  hasHydrated: boolean;
  setUserData: (data: Partial<User>) => void;
  clearUserData: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: "",
      name: "",
      email: "",
      role: undefined,
      token: "",
      hasHydrated: false,

      setUserData: (data) => {
        // Validar datos con Zod antes de guardar
        const parsed = userSchema.partial().safeParse(data);
        if (parsed.success) {
          set((state) => ({
            ...state,
            ...data,
          }));
        }
      },

      clearUserData: () =>
        set({ id: "", name: "", email: "", role: undefined, token: "" }),

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
