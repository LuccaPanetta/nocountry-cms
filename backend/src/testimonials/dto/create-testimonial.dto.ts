// src/testimonials/dto/create-testimonial.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUrl, 
  IsUUID, 
  IsArray,
  IsEnum,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TestimonialStatus } from '../entities/testimonial.entity';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

// ✅ DTO para multimedia (opcional)
export class MultimediaTestimonioDto {
  @ApiProperty({ 
    description: 'Tipo de archivo multimedia',
    enum: MultimediaType,
    example: MultimediaType.IMAGE
  })
  @IsEnum(MultimediaType)
  tipo: MultimediaType;

  @ApiProperty({ 
    description: 'Descripción opcional del archivo',
    required: false,
    example: 'Imagen principal del testimonio'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ 
    description: 'Base64 del archivo a subir',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
  })
  @IsNotEmpty({ message: 'El archivo es requerido' })
  @IsString()
  archivoBase64: string;

  @ApiProperty({ 
    description: 'Nombre original del archivo',
    example: 'mi-testimonio.jpg'
  })
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  @IsString()
  nombreArchivo: string;

  @ApiProperty({ 
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg'
  })
  @IsNotEmpty({ message: 'El tipo MIME es requerido' })
  @IsString()
  mimeType: string;
}

export class CreateTestimonialDto {
  @ApiProperty({ 
    description: 'Contenido principal del testimonio',
    example: 'Este es un testimonio increíble sobre nuestro servicio...'
  })
  @IsString({ message: 'El contenido debe ser texto' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  contenido: string;

  @ApiProperty({ 
    description: 'Título del testimonio (opcional)',
    required: false,
    example: 'Mi experiencia con el producto X',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El título no puede exceder los 200 caracteres' })
  titulo?: string;

  @ApiProperty({ 
    description: 'Nombre del autor (cliente)', 
    required: false,
    example: 'Juan Pérez',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  autorNombre?: string;

  @ApiProperty({ 
    description: 'Empresa del autor (opcional)', 
    required: false,
    example: 'Tech Solutions Inc.',
    maxLength: 150
  })
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'La empresa no puede exceder los 150 caracteres' })
  empresa?: string;

  @ApiProperty({ 
    description: 'Cargo/posición del autor (opcional)', 
    required: false,
    example: 'CEO',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El cargo no puede exceder los 100 caracteres' })
  cargo?: string;

  @ApiProperty({ 
    description: 'URL del video de YouTube (opcional)', 
    required: false,
    example: 'https://www.youtube.com/watch?v=abc123'
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL debe ser válida' })
  videoUrl?: string;

  // ❌ REMOVED: imageUrl ya no existe en la entidad
  // @ApiProperty({ 
  //   description: 'URL de la imagen (Cloudinary, opcional)', 
  //   required: false,
  //   example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
  // })
  // @IsOptional()
  // @IsUrl({}, { message: 'La URL debe ser válida' })
  // imageUrl?: string;

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
  @IsOptional()
  @IsArray({ message: 'Los tags deben ser un array' })
  @IsUUID('4', { each: true, message: 'Cada tag debe ser un UUID válido' })
  tagIds?: string[];

  @ApiProperty({
    description: 'Datos del archivo multimedia (opcional)',
    required: false,
    type: MultimediaTestimonioDto
  })
  @IsOptional()
  multimedia?: MultimediaTestimonioDto;

  @ApiProperty({
    description: 'Estado del testimonio',
    enum: TestimonialStatus,
    default: TestimonialStatus.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(TestimonialStatus, { message: 'El estado debe ser válido' })
  status?: TestimonialStatus;
}