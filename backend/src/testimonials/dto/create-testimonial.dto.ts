// src/testimonials/dto/create-testimonial.dto.ts
import { 
  IsString, IsNotEmpty, IsOptional, IsUrl, IsUUID, 
  IsArray, IsEnum, MaxLength, ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TestimonialStatus } from '../entities/testimonial.entity';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

// DTO para archivo en FormData (NO base64)
export class CreateMultimediaFileDto {
  @ApiProperty({ 
    description: 'Tipo de archivo multimedia',
    enum: MultimediaType,
    example: MultimediaType.IMAGE
  })
  @IsEnum(MultimediaType)
  tipo: MultimediaType;

  @ApiProperty({ 
    description: 'Descripción opcional',
    required: false,
    example: 'Imagen principal del testimonio'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CreateTestimonialDto {
  @ApiProperty({ 
    description: 'Contenido principal',
    example: 'Este es un testimonio increíble...'
  })
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @ApiProperty({ 
    description: 'Título (opcional)',
    required: false,
    example: 'Mi experiencia con el producto X'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({ 
    description: 'Nombre del autor', 
    required: false,
    example: 'Juan Pérez'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  autorNombre?: string;

  @ApiProperty({ 
    description: 'Empresa (opcional)', 
    required: false,
    example: 'Tech Solutions Inc.'
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  empresa?: string;

  @ApiProperty({ 
    description: 'Cargo (opcional)', 
    required: false,
    example: 'CEO'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @ApiProperty({ 
    description: 'URL de video externo', 
    required: false,
    example: 'https://www.youtube.com/watch?v=abc123'
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiProperty({ 
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ 
    description: 'IDs de tags',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

 /*  @ApiProperty({
    description: 'Estado del testimonio',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(TestimonialStatus)
  status?: TestimonialStatus; */
}