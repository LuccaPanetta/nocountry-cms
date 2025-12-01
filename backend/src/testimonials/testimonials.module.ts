// src/testimonials/testimonials.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { Testimonial } from './entities/testimonial.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { MultimediaModule } from '../multimedia/multimedia.module'; // ✅ Importar módulo de multimedia
@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial, Category, Tag]),
     MultimediaModule,
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
  exports: [TypeOrmModule, TestimonialsService] 
})
export class TestimonialsModule {}