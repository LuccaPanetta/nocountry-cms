// src/testimonials/dto/create-testimonial-form.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, IsNotEmpty, IsOptional, IsUrl, IsUUID, 
  IsEnum, MaxLength, MinLength, Matches, IsArray, 
  ValidateIf, IsBoolean, IsNumber, ArrayMinSize, ArrayMaxSize
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

export class CreateTestimonialFormDto {
  @ApiProperty({
    description: 'Contenido principal del testimonio',
    example: 'Este servicio superó todas mis expectativas...',
    minLength: 10,
    maxLength: 5000
  })
  @IsString({ message: 'El contenido debe ser texto' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  @MaxLength(5000, { message: 'El contenido no puede exceder 5000 caracteres' })
  contenido: string;

  @ApiPropertyOptional({
    description: 'Título del testimonio',
    example: 'Experiencia increíble con Producto X',
    maxLength: 200
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser texto' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del autor',
    example: 'María González',
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'El nombre del autor debe ser texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { 
    message: 'El nombre solo puede contener letras y espacios' 
  })
  autorNombre?: string;

  @ApiPropertyOptional({
    description: 'Empresa u organización del autor',
    example: 'Innovatech Solutions',
    maxLength: 150
  })
  @IsOptional()
  @IsString({ message: 'La empresa debe ser texto' })
  @MaxLength(150, { message: 'La empresa no puede exceder 150 caracteres' })
  empresa?: string;

  @ApiPropertyOptional({
    description: 'Cargo o posición del autor',
    example: 'Directora de Marketing',
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'El cargo debe ser texto' })
  @MaxLength(100, { message: 'El cargo no puede exceder 100 caracteres' })
  cargo?: string;

  @ApiPropertyOptional({
    description: 'URL de video externo (YouTube, Vimeo, etc.)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  })
  @IsOptional()
  @IsUrl({}, { 
    message: 'La URL del video debe ser válida (ej: https://www.youtube.com/watch?v=...)' 
  })
  @Matches(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/, {
    message: 'La URL debe ser de YouTube o Vimeo'
  })
  videoUrl?: string;

  @ApiProperty({
    description: 'ID de la categoría (UUID válido)',
    example: '211eb856-ed00-496b-b7d4-9ddb8ab1cfe8'
  })
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La categoría es requerida' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'IDs de tags como string separado por comas o JSON array',
    example: '3d09faca-1bef-49da-ae64-08c211cc98a8,cda3620b-0e3e-4b7b-8eb8-d676b6dbf290',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    
    // Si ya es un array (fue transformado por el interceptor)
    if (Array.isArray(value)) {
      return value;
    }
    
    // Si es string
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      
      // Si es JSON array
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          throw new Error('Formato JSON inválido para tags');
        }
      }
      
      // Si es lista separada por comas
      if (trimmed.includes(',')) {
        return trimmed.split(',').map((id: string) => id.trim());
      }
      
      // Si es un solo ID
      return [trimmed];
    }
    
    // Si es otro tipo
    throw new Error(`Formato inválido para tags. Se esperaba string o array, se recibió: ${typeof value}`);
  })
  @IsArray({ message: 'Los tags deben ser un array de IDs' })
  @ArrayMaxSize(5, { message: 'No puede asignar más de 5 tags' })
  @IsUUID('4', { each: true, message: 'Cada tag debe ser un UUID válido' })
  tagIds: string[] = [];

  @ApiPropertyOptional({
    description: 'Tipo de archivo multimedia',
    enum: MultimediaType,
    example: MultimediaType.IMAGE
  })
  @IsOptional()
  @IsEnum(MultimediaType, { 
    message: `El tipo debe ser ${MultimediaType.IMAGE} o ${MultimediaType.VIDEO}` 
  })
  @ValidateIf(o => o.file !== undefined)
  @Transform(({ value }) => {
    if (!value) return value;
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  })
  tipo?: MultimediaType;

  @ApiPropertyOptional({
    description: 'Descripción del archivo multimedia',
    example: 'Foto del cliente usando nuestro producto',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  toCreateTestimonialDto() {
    // Ahora tagIds ya es un array, así que podemos retornarlo directamente
    return {
      contenido: this.contenido,
      titulo: this.titulo,
      autorNombre: this.autorNombre,
      empresa: this.empresa,
      cargo: this.cargo,
      videoUrl: this.videoUrl,
      categoryId: this.categoryId,
      tagIds: this.tagIds || [],
    };
  }
}