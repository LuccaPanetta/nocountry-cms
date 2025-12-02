// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

// Ambiente
const isProduction = process.env.NODE_ENV === 'production';

// 🔥 Variable opcional para resetear BD EN PRODUCCIÓN
// En Render puedes setear: RESET_DB=true para que se ejecute UNA VEZ
const shouldResetSchema = process.env.RESET_DB === 'true';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  // 🔌 Conexión: si existe DATABASE_URL la usa (Render)
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

  // 🧨 Reglas de sincronización
  synchronize: !isProduction || shouldResetSchema,
  dropSchema: shouldResetSchema,

  // SSL solo en producción (Render exige rejectUnauthorized=false)
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,

  extra: isProduction
    ? { ssl: { rejectUnauthorized: false } }
    : {},

  // 🧩 Auto entidades
  autoLoadEntities: true,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],

  // Logging solo desarrollo
  logging: !isProduction,

  retryAttempts: 5,
  retryDelay: 3000,
};

// 🖨️ Log para verificar que todo anda
console.log('🔧 TYPEORM CONFIG:', {
  environment: process.env.NODE_ENV,
  usingDatabaseUrl: !!process.env.DATABASE_URL,
  synchronize: !isProduction || shouldResetSchema,
  dropSchema: shouldResetSchema,
  sslEnabled: isProduction,
});
