import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { EngagementModule } from './engagement/engagement.module'; 
import { MultimediaModule } from './multimedia/multimedia.module'; 
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', 
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),

    UsersModule, 
    AuthModule,
    TestimonialsModule,
    CategoriesModule,
    TagsModule,
    EngagementModule, 
    MultimediaModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}