import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { TestimonialMediaService } from './testimonial-media.service';
import { TestimonialsController } from '../cloudinary/testimonials.controller'; // ✅ Añadir esta línea

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService, TestimonialMediaService],
  controllers: [TestimonialsController], // ✅ Añadir el controller
  exports: [CloudinaryService, TestimonialMediaService],
})
export class CloudinaryModule {}