import { useQuery } from "@tanstack/react-query";
import { getPublicTestimonials, getPublicTestimonyById, getPublicTestimonyEmbedCode, getTestimonials, getTestimonyById } from "../use-cases/testimonials.service";
import { GetTestimonialsParams,  TestimonyResType} from "@/types/testimony-type";


// Hook para obtener todos los testimonios (admin y editor)
export const useGetTestimonials= () => {
  return useQuery<{ testimonial: TestimonyResType }[]>({
    queryKey: ["testimonials"],
    queryFn: () => getTestimonials(),
   /*  refetchInterval: 60000, */ // se actualiza cada 60 segundos
  });
};

// Hook para obtener un testimonio por ID (admin y editor)
export const useGetTestimonyById= (id: string) => {
  return useQuery<TestimonyResType[]>({
    queryKey: [`testimony-${id}`, id],
    queryFn: () => getTestimonyById(id),
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
