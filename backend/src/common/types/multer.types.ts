// Tipo personalizado para Multer File
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
  stream?: any;
}

// Extender Express Request si es necesario
declare global {
  namespace Express {
    interface Request {
      file?: MulterFile;
      files?: MulterFile[];
    }
  }
}

export {};