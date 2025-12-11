import { apiCategoriesService } from "../general-api";

export const getCategories = async () => {
  try {
    const res = await apiCategoriesService.get("/");
    return res.data;
  } catch (error: any) {  
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};
