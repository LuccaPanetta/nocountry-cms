// src/config/cors.config.ts (añadir al array de allowedOrigins)
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
      'http://localhost:8080', // Para desarrollo de embeds
      'https://localhost:3000',
      'https://localhost:3001',
      this.backendUrl,
      process.env.RENDER_BACKEND_URL,
      process.env.VERCEL_FRONTEND_URL,
      '*', // Permitir todos los orígenes para embeds (ajustar en producción)
    ].filter((origin): origin is string => !!origin);

    const uniqueOrigins = [...new Set(allowedOrigins)];

    console.log('🌐 CORS Origins configurados para embeds:', uniqueOrigins);

    return {
      origin: uniqueOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      credentials: true,
    };
  }
}