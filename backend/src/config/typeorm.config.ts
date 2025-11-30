// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  
  // ✅ USAR DATABASE_URL si existe (Render), sino parámetros individuales
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
  
  // ✅ SYNCHRONIZE: true en desarrollo, false en producción
  synchronize: isDevelopment,
  
  // ✅ SSL para producción
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  extra: isDevelopment ? {} : { 
    ssl: { 
      rejectUnauthorized: false 
    } 
  },
  
  // ✅ Entidades
  autoLoadEntities: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  
  // ✅ Logging
  logging: isDevelopment,
  
  // ✅ Configuración de conexión
  retryAttempts: 5,
  retryDelay: 3000,
};

console.log('🗄️ Configuración Base de Datos:', {
  environment: process.env.NODE_ENV || 'development',
  synchronize: isDevelopment,
  usingDatabaseUrl: !!process.env.DATABASE_URL,
});