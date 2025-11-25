import { IsEnum, IsNotEmpty } from 'class-validator';
import { TestimonialStatus } from '../entities/testimonial.entity';

export class UpdateStatusDto {
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  @IsEnum(TestimonialStatus, { message: 'El estado no es válido.' })
  status: TestimonialStatus;
}