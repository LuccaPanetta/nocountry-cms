// src/testimonials/dto/update-testimonial.dto.ts
import { 
  IsString, IsOptional, IsUrl, IsUUID, 
  IsArray, IsEnum, MaxLength, MinLength 
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTestimonialDto } from './create-testimonial.dto';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

// Primero crea una clase base sin extender
export class UpdateTestimonialDto {
  @ApiProperty({ 
    description: 'Contenido principal',
    example: 'Este es un testimonio actualizado...',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  contenido?: string;

  @ApiProperty({ 
    description: 'Título (opcional)',
    required: false,
    example: 'Mi experiencia actualizada'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({ 
    description: 'Nombre del autor', 
    required: false,
    example: 'Juan Pérez Actualizado'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  autorNombre?: string;

  @ApiProperty({ 
    description: 'Empresa (opcional)', 
    required: false,
    example: 'Tech Solutions Inc. Actualizada'
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  empresa?: string;

  @ApiProperty({ 
    description: 'Cargo (opcional)', 
    required: false,
    example: 'CEO Actualizado'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @ApiProperty({ 
    description: 'URL externa de multimedia (imagen o video)', 
    required: false,
    example: 'https://www.youtube.com/watch?v=abc123'
  })
  @IsOptional()
  @IsUrl()
  multimediaUrl?: string;

  @ApiProperty({ 
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

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

  @ApiProperty({ 
    description: 'Tipo de archivo multimedia (solo si se sube archivo)',
    enum: MultimediaType,
    required: false,
    example: MultimediaType.IMAGE
  })
  @IsOptional()
  @IsEnum(MultimediaType)
  tipo?: MultimediaType;

  @ApiProperty({ 
    description: 'Descripción del archivo multimedia (solo si se sube archivo)',
    required: false,
    example: 'Imagen actualizada del testimonio'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  // NOTA: status NO está aquí porque debe actualizarse con updateStatus
}