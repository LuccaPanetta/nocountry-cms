import { Provider, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const logger = new Logger('CloudinaryProvider');
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Validar que todas las variables estén presentes
    if (!cloudName || !apiKey || !apiSecret) {
      logger.error('Missing Cloudinary environment variables');
      throw new Error('Cloudinary configuration is incomplete');
    }

    logger.log('Cloudinary configured successfully');
    
    return cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  },
};