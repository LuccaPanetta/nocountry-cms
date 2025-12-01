export type CardTestimonyType = {
  testimony: {
    id: string;
    titulo: string;
    autor: string;
    empresa: string;
    cargo: string;
    contenido: string;
    estado: string;
    categoria: string;
    creado_en: string;
    actualizado_en: string;
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