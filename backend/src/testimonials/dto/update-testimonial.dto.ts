// src/testimonials/dto/update-testimonial.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTestimonialDto } from './create-testimonial.dto';

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {
  // Hereda todos los campos de CreateTestimonialDto
  // Todos los campos son opcionales para actualización
}