import { Provider, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const logger = new Logger('CloudinaryProvider');
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Configurar Cloudinary
    const config = cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    logger.log('☁️  Cloudinary configurado correctamente');
    return config;
  },
};