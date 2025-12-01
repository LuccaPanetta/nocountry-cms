// src/testimonials/dto/create-testimonial.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUrl, 
  IsUUID, 
  IsArray,
  IsEnum 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TestimonialStatus } from '../entities/testimonial.entity';

export class CreateTestimonialDto {
  @ApiProperty({ 
    description: 'Contenido principal del testimonio',
    example: 'Este es un testimonio increíble sobre nuestro servicio...'
  })
  @IsString({ message: 'El contenido debe ser texto' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  contenido: string; // ✅ Cambiado de 'content' a 'contenido'

  @ApiProperty({ 
    description: 'Nombre del autor (cliente)', 
    required: false,
    example: 'Juan Pérez'
  })
  @IsString({ message: 'El nombre del autor debe ser texto' })
  @IsOptional()
  autorNombre?: string; // ✅ Cambiado de 'authorName' a 'autorNombre'

  @ApiProperty({ 
    description: 'URL del video de YouTube (opcional)', 
    required: false,
    example: 'https://www.youtube.com/watch?v=abc123'
  })
  @IsUrl({}, { message: 'La URL debe ser válida' })
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ 
    description: 'URL de la imagen (Cloudinary, opcional)', 
    required: false,
    example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
  })
  @IsUrl({}, { message: 'La URL debe ser válida' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ 
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  categoryId: string;

  @ApiProperty({ 
    description: 'IDs de los tags (opcional)',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    required: false,
    type: [String]
  })
  @IsArray({ message: 'Los tags deben ser un array' })
  @IsUUID('4', { each: true, message: 'Cada tag debe ser un UUID válido' })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({
    description: 'Estado del testimonio (automático, no enviar)',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
    required: false
  })
  @IsEnum(TestimonialStatus, { message: 'El estado debe ser válido' })
  @IsOptional()
  status?: TestimonialStatus;
}