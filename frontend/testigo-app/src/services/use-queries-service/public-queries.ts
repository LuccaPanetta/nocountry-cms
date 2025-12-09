import { useQuery } from '@tanstack/react-query';
import { 
  getPublicTestimonials, 
  getPublicStats,
  getPublicStatsByCategory,
  getPublicTestimonialById,
  getEmbedCode,
  getRelatedTestimonials,
  TestimonialsQueryParams,
  SearchQueryParams
} from '../use-cases/public-api-service';

// Hook para obtener testimonios públicos
export const usePublicTestimonials = (params?: TestimonialsQueryParams) => {
  return useQuery({
    queryKey: ['public-testimonials', params],
    queryFn: () => getPublicTestimonials(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener estadísticas
export const usePublicStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: getPublicStats,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener estadísticas por categoría
export const usePublicStatsByCategory = () => {
  return useQuery({
    queryKey: ['public-stats-categories'],
    queryFn: getPublicStatsByCategory,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener un testimonio específico
export const usePublicTestimonial = (id: string) => {
  return useQuery({
    queryKey: ['public-testimonial', id],
    queryFn: () => getPublicTestimonialById(id),
    enabled: !!id, // Solo ejecuta si hay un ID
  });
};

// Hook para obtener código de embed
export const useEmbedCode = (id: string) => {
  return useQuery({
    queryKey: ['embed-code', id],
    queryFn: () => getEmbedCode(id),
    enabled: !!id,
  });
};

// Hook para obtener testimonios relacionados
export const useRelatedTestimonials = (id: string) => {
  return useQuery({
    queryKey: ['related-testimonials', id],
    queryFn: () => getRelatedTestimonials(id),
    enabled: !!id,
  });
};