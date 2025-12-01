import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config'; 
import { UsersModule } from './users/users.module'; 
import { AuthModule } from './auth/auth.module'; 
import { TestimonialsModule } from './testimonials/testimonials.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { EngagementModule } from './engagement/engagement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule, 
    AuthModule,
    TestimonialsModule,
    CategoriesModule,
    TagsModule,
    EngagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
