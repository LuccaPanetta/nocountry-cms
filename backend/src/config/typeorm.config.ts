import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL, 
  
  // ✅ SSL OBLIGATORIO PARA RENDER
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  extra: isDevelopment ? {} : { ssl: { rejectUnauthorized: false } },
  
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  
  autoLoadEntities: true, 
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: isDevelopment, 
  logging: isDevelopment ? ['query', 'error'] : ['error'],
  
  // ✅ RETRY PARA CONEXIONES EN PRODUCCIÓN
  retryAttempts: 3,
  retryDelay: 3000,
};

// Log para verificar configuración
console.log('🗄️ Configuración Base de Datos:', {
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  sslEnabled: !isDevelopment,
  synchronize: isDevelopment
});