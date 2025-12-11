import { useQuery } from "@tanstack/react-query";
import { getPublicTestimonials, getPublicTestimonyById, getPublicTestimonyEmbedCode, getTestimonials, getTestimonyById } from "../use-cases/testimonials.service";
import { GetTestimonialsParams,  TestimonyResType} from "@/types/testimony-type";
import { useUserStore } from "@/store/userStore";


// Hook para obtener todos los testimonios (admin y editor)
export const useGetTestimonials = () => {
  const { token, hasHydrated } = useUserStore();
  return useQuery<{ testimonial: TestimonyResType }[]>({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
    enabled: hasHydrated && !!token, 
  });
};

// Hook para obtener un testimonio por ID (admin y editor)

export const useGetTestimonyById= (id: string) => {
  const { token, hasHydrated } = useUserStore();
  return useQuery<TestimonyResType>({
    queryKey: [`testimony-${id}`, id],
    queryFn: () => getTestimonyById(id),
    enabled: hasHydrated && !!token,
  });
};


//  Hook para obtener todos los testimonios públicos (usuarios finales)

export function useGetPublicTestimonials(params: GetTestimonialsParams) {
  return useQuery({
    queryKey: ["publicTestimonials", params],
    queryFn: () => getPublicTestimonials(params),
    placeholderData: (prev) => prev,
  });
}


//  Hook para obtener testimonio publico por ID y registrar visualización

export function useGetPublicTestimonyById(id: string) {
  return useQuery({
    queryKey: ["publicTestimonyById", id],
    queryFn: () => getPublicTestimonyById(id),
    enabled: false,
    placeholderData: (prev) => prev,
  });
}

//  Hook para obtener testimonio publico por ID y registrar embed

export function useGetPublicTestimonyEmbedCodeById(id: string) {
  return useQuery({
    queryKey: ["publicTestimonyEmbedCodeById", id],
    queryFn: () => getPublicTestimonyEmbedCode(id),
    enabled: false,
    placeholderData: (prev) => prev,
  });
}
