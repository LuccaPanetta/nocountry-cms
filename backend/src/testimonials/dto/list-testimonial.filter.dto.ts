import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TestimonialStatus } from '../entities/testimonial.entity'; 

export class ListTestimonialFilterDto {
  @IsOptional()
  @IsEnum(TestimonialStatus, { message: 'El estado no es válido.' })
  status?: TestimonialStatus;

  @IsOptional()
  @IsString({ message: 'El filtro de categoría debe ser texto.' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'El filtro de tags debe ser texto.' })
  tags?: string;
}