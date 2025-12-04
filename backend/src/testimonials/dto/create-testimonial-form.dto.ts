import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, IsNotEmpty, IsOptional, IsUrl, IsUUID, 
  IsEnum, MaxLength, MinLength, Matches, IsArray, 
  ValidateIf, ArrayMaxSize
} from 'class-validator';
import { Transform } from 'class-transformer';
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
    description: 'URL externa de multimedia (imagen o video)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  })
  @IsOptional()
  @IsUrl({}, { 
    message: 'La URL de multimedia debe ser válida' 
  })
  multimediaUrl?: string; // Cambiado de videoUrl a multimediaUrl

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
    
    if (Array.isArray(value)) {
      return value;
    }
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      
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
      
      if (trimmed.includes(',')) {
        return trimmed.split(',').map((id: string) => id.trim());
      }
      
      return [trimmed];
    }
    
    throw new Error(`Formato inválido para tags. Se esperaba string o array, se recibió: ${typeof value}`);
  })
  @IsArray({ message: 'Los tags deben ser un array de IDs' })
  @ArrayMaxSize(5, { message: 'No puede asignar más de 5 tags' })
  @IsUUID('4', { each: true, message: 'Cada tag debe ser un UUID válido' })
  tagIds: string[] = [];

  @ApiPropertyOptional({
    description: 'Tipo de archivo multimedia (solo si se sube archivo)',
    enum: MultimediaType,
    example: MultimediaType.IMAGE
  })
  @IsOptional()
  @IsEnum(MultimediaType, { 
    message: `El tipo debe ser ${MultimediaType.IMAGE} o ${MultimediaType.VIDEO}` 
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
    return {
      contenido: this.contenido,
      titulo: this.titulo,
      autorNombre: this.autorNombre,
      empresa: this.empresa,
      cargo: this.cargo,
      multimediaUrl: this.multimediaUrl, // Cambiado aquí también
      categoryId: this.categoryId,
      tagIds: this.tagIds || [],
      tipo: this.tipo,
      descripcion: this.descripcion
    };
  }
}