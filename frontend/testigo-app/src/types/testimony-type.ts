// Tipo para testimonios en todos sus estados
export type TestimonyResType = {
  id: string;
  titulo: string;
  autor: string;
  empresa: string;
  cargo: string;
  contenido: string;
  status: string;
  category: string;
  creadoEn: string;
  actualizadoEn: string;
  tags: string[];
  multimedia: {
    id: string;
    testimonio_id: string;
    tipo: string;
    url: string;
    descripcion: string;
  };
};

// Tipo para testimonios públicos
export type PublicTestimonyResType = {
  id: string;
  title: string;
  author: string;
  company: string;
  position: string;
  content: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  multimedia: {
    id: string;
    type: string;
    url: string;
    description: string;
    fileName: string;
    publicId: string;
  };
  engagement: {
    views: number;
    embeds: number;
    lastUpdated: Date;
  };
  hasMultimedia: boolean;
  mediaType: string;
};

export type PublicTestimonialsResponse = {
  testimonials: PublicTestimonyResType[];
  total: number;
  page: number;
  limit: number;
};

// Tipo para crear o actualizar un testimonio
export type TestimonyReqType = {
  titulo: string;
  autorNombre: string;
  empresa: string;
  cargo: string;
  contenido: string;
  categoryId: string;
  creadoEn: string;
  actualizadoEn: string;
  tags: string[];
  multimedia: {
    tipo: string;
    url: string;
    descripcion: string;
  };
};

export type TestimonyStatusType = {
  status: string;
};

export interface GetTestimonialsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  order?: string;
}
