import { apiTagsService } from "../general-api";

export const getTags = async () => {
  try {
    const res = await apiTagsService.get("/");
    return res.data;
  } catch (error: any) {  
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};