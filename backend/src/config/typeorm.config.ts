import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

const isDevelopment = process.env.NODE_ENV !== 'production';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  
  autoLoadEntities: true, 
  
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  
  synchronize: isDevelopment, 
  
 
  logging: isDevelopment ? ['query', 'error'] : false,
};
