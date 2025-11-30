// src/app.module.ts
import { Module } from '@nestjs/common';
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
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    DatabaseModule,
    UsersModule, 
    AuthModule,
    TestimonialsModule,
    CategoriesModule,
    TagsModule,
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
export class AppModule {}