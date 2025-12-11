import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as dotenv from 'dotenv';

dotenv.config();

export class CorsConfig {
  private static isProduction = process.env.NODE_ENV === 'production';
  private static backendUrl = process.env.RENDER_BACKEND_URL || 
    (this.isProduction ? 'https://tu-backend.onrender.com' : `http://localhost:${process.env.PORT || 3000}`);

  static createConfig(): CorsOptions {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      this.backendUrl,
      process.env.RENDER_BACKEND_URL,
    ].filter((origin): origin is string => !!origin);

    // Eliminar duplicados
    const uniqueOrigins = [...new Set(allowedOrigins)];

    console.log('🌐 CORS Origins configurados:', uniqueOrigins);

    return {
      origin: uniqueOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      credentials: true,
    };
  }
}