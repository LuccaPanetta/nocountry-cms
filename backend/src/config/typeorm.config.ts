// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  
  // Configuración de conexión
  ...(process.env.DATABASE_URL 
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_NAME || 'testimonial_cms',
      }
  ),
  
  // ✅ SYNCHRONIZE: true en desarrollo para recrear tablas
  synchronize: true, // IMPORTANTE: true para que se creen las tablas
  
  // SSL para producción
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  extra: isDevelopment ? {} : { 
    ssl: { 
      rejectUnauthorized: false 
    } 
  },
  
  // Entidades
  autoLoadEntities: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  
  // Logging
  logging: true, // Activar para ver qué está pasando
  
  retryAttempts: 5,
  retryDelay: 3000,
};

console.log('🔧 CONFIGURACIÓN TYPEORM:', {
  environment: process.env.NODE_ENV || 'development',
  synchronize: true, // Debe ser true
  usingDatabaseUrl: !!process.env.DATABASE_URL,
});