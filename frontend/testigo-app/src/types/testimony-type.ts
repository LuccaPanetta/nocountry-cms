export type TestimonyType = {
  testimonial: {
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
};


export type TestimonyStatusType = {
  testimonial: {
    status: string;
  };
};