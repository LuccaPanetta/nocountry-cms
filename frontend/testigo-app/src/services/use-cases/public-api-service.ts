import { apiPublicTestimonialsService } from '../general-api';

// Tipos para los parámetros de búsqueda
// Tipos para los parámetros de búsqueda
export type TestimonialsQueryParams = {
    page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  hasMultimedia?: boolean;
  mediaType?: 'video' | 'image' | 'audio' | 'none' | 'all' | undefined; // Agrega 'all'
  sort?: 'newest' | 'oldest' | 'popular' | 'views';
};

export type SearchQueryParams = {
  q: string;
  page?: number;
  limit?: number;
};

// Servicio para obtener testimonios públicos
export const getPublicTestimonials = async (params?: TestimonialsQueryParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.tags?.length) queryParams.append('tags', params.tags.join(','));
  
  if (params?.hasMultimedia !== undefined) {
    queryParams.append('hasMultimedia', params.hasMultimedia.toString());
  }
  
  // Solo agregar si tiene un valor válido (no undefined)
  if (params?.mediaType) {
    queryParams.append('mediaType', params.mediaType);
  }
  
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const url = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiPublicTestimonialsService.get(url);
  return response.data;
};

// Servicio para búsqueda avanzada
export const searchPublicTestimonials = async (params: SearchQueryParams) => {
  const queryParams = new URLSearchParams();
  queryParams.append('q', params.q);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/search?${queryParams.toString()}`;
  const response = await apiPublicTestimonialsService.get(url);
  return response.data;
};

// Servicio para obtener un testimonio específico
export const getPublicTestimonialById = async (id: string) => {
  const response = await apiPublicTestimonialsService.get(`/${id}`);
  return response.data;
};

// Servicio para obtener código de embed
export const getEmbedCode = async (id: string) => {
  const response = await apiPublicTestimonialsService.get(`/embeds/${id}/code`);
  return response.data;
};

// Servicio para obtener estadísticas
export const getPublicStats = async () => {
  const response = await apiPublicTestimonialsService.get('/stats');
  return response.data;
};

// Servicio para obtener estadísticas por categoría
export const getPublicStatsByCategory = async () => {
  const response = await apiPublicTestimonialsService.get('/stats/categories');
  return response.data;
};

// Servicio para obtener testimonios relacionados
export const getRelatedTestimonials = async (id: string) => {
  const response = await apiPublicTestimonialsService.get(`/${id}/related`);
  return response.data;
};