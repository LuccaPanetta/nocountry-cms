import { TagType } from "@/types/tag-type"; // Asumiendo que existe
import { useQuery } from "@tanstack/react-query";
import { getTags } from "../use-cases/tags-service";

export const useGetTags = () => {
  return useQuery<TagType[]>({
    queryKey: ["tags"],
    queryFn: () => getTags(),
  });
};