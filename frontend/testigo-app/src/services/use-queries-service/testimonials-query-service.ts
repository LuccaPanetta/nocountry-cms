import { useQuery } from "@tanstack/react-query";
import { getTestimonials, getTestimonyById } from "../use-cases/testimonials.service";
import { TestimonyType } from "@/types/testimony-type";

export const useGetTestimonials= () => {
  return useQuery<TestimonyType[]>({
    queryKey: ["testimonials"],
    queryFn: () => getTestimonials(),
   /*  refetchInterval: 60000, */ // se actualiza cada 60 segundos
  });
};

export const useGetTestimonyById= (id: string) => {
  return useQuery<TestimonyType[]>({
    queryKey: ["testimonials", id],
    queryFn: () => getTestimonyById(id),
  });
};

