// src/testimonials/testimonials.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './services/testimonials.service';
import { TestimonialValidationService } from './services/validation.service';
import { TestimonialQueryService } from './services/query.service';
import { TestimonialDtoProcessorService } from './services/dto-processor.service';
import { Testimonial } from './entities/testimonial.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TestimonialMapper } from './mappers/testimonial.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial, Category, Tag]),
    forwardRef(() => MultimediaModule), // Para resolver dependencia circular
    CloudinaryModule, // Para Cloudinary si MultimediaService lo necesita
  ],
  controllers: [TestimonialsController],
  providers: [
    TestimonialsService,
    TestimonialValidationService,
    TestimonialQueryService,
    TestimonialDtoProcessorService,
    TestimonialMapper,
  ],
  exports: [
    TestimonialsService,
    TypeOrmModule, // Para que otros módulos puedan usar los repositorios
    TestimonialQueryService, // Si otros módulos necesitan consultas
  ],
})
export class TestimonialsModule {}