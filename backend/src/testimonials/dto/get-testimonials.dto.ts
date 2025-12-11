import { IsOptional, IsString, IsUUID, IsEnum, IsArray } from 'class-validator';
import { TestimonialStatus } from '../entities/testimonial.entity';

export class GetTestimonialsDto {
    
    @IsOptional()
    @IsEnum(TestimonialStatus)
    status?: TestimonialStatus;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true }) 
    tags?: string[];
    
}