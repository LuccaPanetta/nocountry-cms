// src/app.module.ts (NO CAMBIES ESTE ARCHIVO)
import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config'; 
import { UsersModule } from './users/users.module'; 
import { AuthModule } from './auth/auth.module'; 
import { TestimonialsModule } from './testimonials/testimonials.module';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { MultimediaModule } from './multimedia/multimedia.module'; 
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PublicModule } from './public/public.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig), // ✅ Usa tu configuración actual
    DatabaseModule,
    UsersModule, 
    AuthModule,
    TestimonialsModule,
    CategoriesModule,
    TagsModule,
    MultimediaModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD, 
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log('🎯 ORDEN DE INICIALIZACIÓN:');
    console.log('1. TypeORM se conecta (synchronize: true)');
    console.log('2. InitService - RESET completo de BD');
    console.log('3. TypeORM sincroniza tablas (vacías)');
    console.log('4. DatabaseModule - Ejecuta seeds');
    console.log('5. Módulos de negocio se inicializan');
  }
}