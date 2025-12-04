// src/testimonials/dto/update-status.dto.ts (nuevo archivo)
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TestimonialStatus } from '../entities/testimonial.entity';

export class UpdateStatusDto {
  @ApiProperty({ 
    description: 'Nuevo estado del testimonio',
    enum: TestimonialStatus,
    example: TestimonialStatus.APPROVED
  })
  @IsEnum(TestimonialStatus)
  status: TestimonialStatus;
}