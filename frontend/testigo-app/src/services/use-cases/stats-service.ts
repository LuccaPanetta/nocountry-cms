import { apiStatisticsService } from "../general-api";

export const getStatistics = async () => {

    try {
      const res = await apiStatisticsService.get("/");
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  }
export const getStatisticsByCategory = async () => {

    try {
      const res = await apiStatisticsService.get("/categories");
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error de conexión");
    }
  }

