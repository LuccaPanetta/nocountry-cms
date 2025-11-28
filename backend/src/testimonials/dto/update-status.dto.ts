import { IsEnum } from 'class-validator';
import { TestimonialStatus } from '../entities/testimonial.entity';

export class UpdateStatusDto {
    @IsEnum(TestimonialStatus)
    status: TestimonialStatus; 
}