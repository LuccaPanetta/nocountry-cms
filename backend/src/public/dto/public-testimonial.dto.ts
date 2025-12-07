// src/public/dto/public-testimonial.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TestimonialStatus } from '../../testimonials/entities/testimonial.entity';
import { IsOptional, IsString, IsArray, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

export class PublicMultimediaDto {
  @ApiProperty({ 
    description: 'ID único del archivo multimedia',
    example: '7d461164-d6d3-490e-9c7e-59dae661e261' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Tipo de archivo multimedia',
    enum: MultimediaType,
    example: MultimediaType.VIDEO 
  })
  type: MultimediaType;

  @ApiProperty({ 
    description: 'URL del archivo multimedia',
    example: 'https://res.cloudinary.com/dkkzwhtfx/video/upload/...' 
  })
  url: string;

  @ApiProperty({ 
    description: 'URL alternativa (thumbnail para videos)',
    example: 'https://res.cloudinary.com/dkkzwhtfx/image/upload/...',
    required: false 
  })
  thumbnailUrl?: string;

  @ApiProperty({ 
    description: 'Descripción del archivo multimedia',
    example: 'Video testimonio del cliente',
    required: false 
  })
  description?: string;

  @ApiProperty({ 
    description: 'Ancho del archivo (píxeles)',
    example: 1920,
    required: false 
  })
  width?: number;

  @ApiProperty({ 
    description: 'Alto del archivo (píxeles)',
    example: 1080,
    required: false 
  })
  height?: number;

  @ApiProperty({ 
    description: 'Duración en segundos (para video/audio)',
    example: 120,
    required: false 
  })
  duration?: number;
}

export class PublicEngagementDto {
  @ApiProperty({ 
    description: 'Número de visualizaciones del testimonio',
    example: 150 
  })
  views: number;

  @ApiProperty({ 
    description: 'Número de veces que ha sido incrustado',
    example: 25 
  })
  embeds: number;

  @ApiProperty({ 
    description: 'Última actualización de métricas',
    example: '2025-12-05T10:30:00.000Z'
  })
  lastUpdated: Date;
}

export class SearchTestimonialsDto {
  @ApiProperty({ 
    description: 'Término de búsqueda',
    required: false 
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ 
    description: 'Categoría',
    required: false 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    description: 'Tags',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Filtrar por multimedia',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasMultimedia?: boolean;

  @ApiProperty({ 
    description: 'Tipo de multimedia',
    required: false,
    enum: ['video', 'image', 'audio']
  })
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiProperty({ 
    description: 'Mínimo de vistas',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minViews?: number;

  @ApiProperty({ 
    description: 'Número de página',
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Límite por página',
    required: false,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Ordenar por',
    required: false,
    enum: ['newest', 'oldest', 'popular', 'views'],
    default: 'newest'
  })
  @IsOptional()
  @IsString()
  sort?: string = 'newest';
}
export class PublicTestimonialDto {
  @ApiProperty({ 
    description: 'ID único del testimonio',
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Título del testimonio',
    example: 'Experiencia increíble con Producto X' 
  })
  title: string;

  @ApiProperty({ 
    description: 'Contenido del testimonio',
    example: 'Este servicio superó todas mis expectativas...' 
  })
  content: string;

  @ApiProperty({ 
    description: 'Nombre del autor del testimonio',
    example: 'María González' 
  })
  author: string;

  @ApiProperty({ 
    description: 'Empresa del autor',
    example: 'Innovatech Solutions',
    required: false 
  })
  company?: string;

  @ApiProperty({ 
    description: 'Cargo del autor',
    example: 'Directora de Marketing',
    required: false 
  })
  position?: string;

  @ApiProperty({ 
    description: 'Estado del testimonio',
    enum: TestimonialStatus,
    example: 'approved'
  })
  status: TestimonialStatus;

  @ApiProperty({ 
    description: 'Video URL externa (YouTube, Vimeo)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    required: false 
  })
  videoUrl?: string;

  @ApiProperty({ 
    description: 'Categoría del testimonio',
    example: 'tecnología' 
  })
  category: string;

  @ApiProperty({ 
    description: 'Tags asociados al testimonio',
    example: ['tecnología', 'servicio'],
    type: [String] 
  })
  tags: string[];

   @ApiProperty({ 
    description: 'Multimedia asociada',
    type: () => PublicMultimediaDto,
    required: false 
  })
  multimedia?: PublicMultimediaDto;

  @ApiProperty({ 
    description: 'Fecha de creación',
    example: '2025-12-02T14:11:54.402Z' 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Fecha de última actualización',
    example: '2025-12-02T14:11:59.679Z',
    required: false 
  })
  updatedAt?: Date;

@ApiProperty({ 
    description: 'Indica si tiene contenido multimedia',
    example: true
  })
  hasMultimedia: boolean;

  @ApiProperty({ 
    description: 'Tipo de contenido multimedia principal',
    enum: ['video', 'image', 'audio', 'none'],
    example: 'video'
  })
  mediaType: string;

  @ApiProperty({ 
    description: 'Métricas de engagement',
    type: PublicEngagementDto
  })
  engagement: PublicEngagementDto;
  
}

export class EmbedCodeResponseDto {
  @ApiProperty({ 
    description: 'Código HTML para incrustar',
    example: '<div class="testimonial-embed">...</div>'
  })
  html: string;

  @ApiProperty({ 
    description: 'Script para incrustar dinámicamente',
    example: '<script src="https://api.tu-cms.com/api/v1/public/embed/238b7b76-d72c-4d23-b682-39acfa8175a3.js"></script>'
  })
  script: string;

  @ApiProperty({ 
    description: 'ID del testimonio',
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3'
  })
  testimonialId: string;

  @ApiProperty({ 
    description: 'URL de la API para este testimonio',
    example: 'https://api.tu-cms.com/api/v1/public/testimonials/238b7b76-d72c-4d23-b682-39acfa8175a3'
  })
  apiUrl: string;

  @ApiProperty({ 
    description: 'URL de vista previa',
    example: 'https://api.tu-cms.com/api/v1/public/embeds/238b7b76-d72c-4d23-b682-39acfa8175a3/preview'
  })
  previewUrl: string;

  @ApiProperty({ 
    description: 'Tiene multimedia',
    example: true
  })
  hasMultimedia: boolean;
}

export class PublicTestimonialsResponseDto {
  @ApiProperty({ 
    description: 'Lista de testimonios',
    type: [PublicTestimonialDto] 
  })
  testimonials: PublicTestimonialDto[];

  @ApiProperty({ 
    description: 'Total de testimonios',
    example: 25
  })
  total: number;

  @ApiProperty({ 
    description: 'Página actual',
    example: 1
  })
  page: number;

  @ApiProperty({ 
    description: 'Límite por página',
    example: 10
  })
  limit: number;
}