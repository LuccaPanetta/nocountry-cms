import { LoginType } from "@/types/login-type";
import { apiAuthService } from "../general-api";

export const postLogin = async (data: LoginType) => {
  try {
    const res = await apiAuthService.post("/login", data);
    return res.data;
  } catch (error: any) {
  
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};
