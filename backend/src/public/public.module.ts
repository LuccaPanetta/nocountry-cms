// src/public/public.module.ts (CORREGIDO)
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TestimonialsModule } from '../testimonials/testimonials.module';
import { EngagementModule } from '../engagement/engagement.module';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { Multimedia } from '../multimedia/entities/multimedia.entity';
import { EngagementMetric } from '../engagement/entities/engagement.entity'; // ✅ AGREGADO
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';

@Module({
  imports: [
    forwardRef(() => TestimonialsModule),
    forwardRef(() => EngagementModule),
    TypeOrmModule.forFeature([
      Testimonial,
      Multimedia,
      EngagementMetric, // ✅ AGREGADO
      Category,
      Tag,
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}