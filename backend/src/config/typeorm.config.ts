import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL, 
  
  // Si NO existe DATABASE_URL, usa los campos separados 
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  
  autoLoadEntities: true, 
  
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  
  synchronize: isDevelopment, 
  
  logging: isDevelopment ? ['query', 'error'] : false,
};
