// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

// Si NO es producción → estamos en desarrollo
const isDevelopment = process.env.NODE_ENV !== 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  // 🔌 Conexión: usa DATABASE_URL o variables locales
  ...(process.env.DATABASE_URL
    ? { 
        url: process.env.DATABASE_URL 
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_NAME || 'testimonial_cms',
      }
  ),

  // 🔥 Solo sincronizar DB en desarrollo
  synchronize: isDevelopment,

  // 🔐 SSL solo para producción (Render)
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  extra: isDevelopment
    ? {}
    : { ssl: { rejectUnauthorized: false } },

  // 📦 Auto cargar entidades
  autoLoadEntities: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  // 📝 logging solo en desarrollo
  logging: isDevelopment,

  retryAttempts: 5,
  retryDelay: 3000,
};

// 🖨️ Log real
console.log('🔧 CONFIGURACIÓN TYPEORM:', {
  environment: process.env.NODE_ENV,
  synchronize: isDevelopment,   // <-- correcto
  usingDatabaseUrl: !!process.env.DATABASE_URL,
  sslEnabled: !isDevelopment,
});
