// src/config/cors.config.ts
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as dotenv from 'dotenv';

dotenv.config();

export class CorsConfig {
  private static isProduction = process.env.NODE_ENV === 'production';
  
  // URLs importantes
  private static backendUrl = process.env.RENDER_BACKEND_URL || 
    (this.isProduction ? 'https://tu-backend.onrender.com' : `http://localhost:${process.env.PORT || 3000}`);
  
  private static vercelFrontend = process.env.VERCEL_FRONTEND_URL;
  private static embedTesterUrl = process.env.VERCEL_FRONTEND_EMBED_TESTER;
  
  // Lista de dominios de pruebas comunes
  private static testingDomains = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'https://localhost:3000',
    'https://localhost:8080',
    'file://', // Para archivos locales
    'null',    // Para archivos locales abiertos directamente
  ];

  // Dominios de Vercel patterns (para todos los proyectos Vercel)
  private static vercelPatterns = [
    'https://*.vercel.app',
    'https://*.now.sh',
  ];

  // Dominios de Render patterns
  private static renderPatterns = [
    'https://*.onrender.com',
  ];

  // Dominios de desarrollo populares
  private static devDomains = [
    'https://codepen.io',
    'https://jsfiddle.net',
    'https://codesandbox.io',
    'https://stackblitz.com',
  ];

  static createConfig(): CorsOptions {
    // Construir array de orígenes permitidos
    const allowedOrigins = [
      // URLs específicas de tu configuración
      this.backendUrl,
      this.vercelFrontend,
      this.embedTesterUrl,
      
      // Dominios de desarrollo y pruebas
      ...this.testingDomains,
      
      // Patrones de Vercel
      ...this.vercelPatterns,
      
      // Patrones de Render
      ...this.renderPatterns,
      
      // Dominios de desarrollo populares
      ...this.devDomains,
      
      // Para desarrollo local con archivos HTML
      '*://localhost:*',
      '*://127.0.0.1:*',
    ].filter((origin): origin is string => !!origin);

    // Filtrar duplicados y null/undefined
    const uniqueOrigins = [...new Set(allowedOrigins)];

    console.log('🌐 CORS Origins configurados:');
    console.log('- Backend URL:', this.backendUrl);
    console.log('- Vercel Frontend:', this.vercelFrontend);
    console.log('- Embed Tester URL:', this.embedTesterUrl);
    console.log('- Total origins permitidos:', uniqueOrigins.length);

    // En desarrollo, puedes usar una función para mayor flexibilidad
    const originFunction = (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir todas las solicitudes sin origen (como archivos locales)
      if (!origin) {
        return callback(null, true);
      }

      // Permitir cualquier origen en desarrollo
      if (!this.isProduction) {
        console.log(`✅ CORS permitido en desarrollo: ${origin}`);
        return callback(null, true);
      }

      // En producción, verificar contra la lista
      const isAllowed = uniqueOrigins.some(allowedOrigin => {
        // Comparación exacta
        if (origin === allowedOrigin) return true;
        
        // Comparación con patrones wildcard
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace('.', '\\.').replace('*', '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        
        return false;
      });

      if (isAllowed) {
        console.log(`✅ CORS permitido: ${origin}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS bloqueado: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    };

    return {
      origin: this.isProduction ? originFunction : true, // En producción usa la función, en desarrollo permite todo
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'X-Requested-With',
        'X-API-Key',
        'X-Testimonial-ID',
        'X-Has-Multimedia',
        'X-Media-Type'
      ],
      exposedHeaders: [
        'X-Testimonial-ID',
        'X-Has-Multimedia',
        'X-Media-Type',
        'Content-Disposition'
      ],
      credentials: true,
      maxAge: 86400, // Cache preflight requests por 24 horas
      preflightContinue: false,
      optionsSuccessStatus: 204
    };
  }
}