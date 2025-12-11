import { useQuery } from "@tanstack/react-query";
import { getStatistics, getStatisticsByCategory } from "../use-cases/stats-service";

export function useGetPublicStatistics() {
  return useQuery({
    queryKey: ["publicStatistics"],
    queryFn: () => getStatistics(),
    placeholderData: (prev) => prev,
  });
}

export function useGetPublicStatisticsByCategories() {
  return useQuery({
    queryKey: ["publicStatisticsByCAtegories"],
    queryFn: () => getStatisticsByCategory(),
    placeholderData: (prev) => prev,
  });
}
