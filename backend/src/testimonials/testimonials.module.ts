// src/testimonials/testimonials.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { Testimonial } from './entities/testimonial.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // ← CORREGIDO

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial, Category, Tag]),
    forwardRef(() => MultimediaModule), // Inyección circular
    CloudinaryModule, // ← CORREGIDO
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
  exports: [TestimonialsService, TypeOrmModule],
})
export class TestimonialsModule {}