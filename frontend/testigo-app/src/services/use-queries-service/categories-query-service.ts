import { CategoryType } from "@/types/category-type";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../use-cases/categories-service";

export const useGetCategories= () => {
  return useQuery<CategoryType[]>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
};
