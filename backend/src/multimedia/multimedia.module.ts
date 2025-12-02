// src/multimedia/multimedia.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaService } from './multimedia.service';
import { MultimediaController } from './multimedia.controller';
import { Multimedia } from './entities/multimedia.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { TestimonialsModule } from '../testimonials/testimonials.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // ← CORREGIDO
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Multimedia, Testimonial]),
    forwardRef(() => TestimonialsModule), // Inyección circular
    CloudinaryModule, // ← CORREGIDO
  ],
  controllers: [MultimediaController],
  providers: [MultimediaService],
  exports: [MultimediaService, TypeOrmModule],
})
export class MultimediaModule {}