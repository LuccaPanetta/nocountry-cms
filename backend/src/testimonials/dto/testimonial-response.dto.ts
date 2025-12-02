// src/testimonials/dto/testimonial-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TestimonialStatus } from '../entities/testimonial.entity';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

// Primero definir MultimediaResponseDto
export class MultimediaResponseDto {
  @ApiProperty({ 
    description: 'ID único del archivo multimedia',
    example: '7d461164-d6d3-490e-9c7e-59dae661e261' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Tipo de archivo multimedia',
    enum: MultimediaType,
    example: 'VIDEO' 
  })
  tipo: MultimediaType;

  @ApiProperty({ 
    description: 'URL del archivo multimedia',
    example: 'https://res.cloudinary.com/dkkzwhtfx/video/upload/...' 
  })
  url: string;

  @ApiProperty({ 
    description: 'Descripción del archivo multimedia',
    example: 'Foto del cliente usando nuestro producto' 
  })
  descripcion: string;
}

// TestimonialDataDto - contiene los datos del testimonio (para uso interno)
export class TestimonialDataDto {
  @ApiProperty({ 
    description: 'ID único del testimonio',
    example: '238b7b76-d72c-4d23-b682-39acfa8175a3' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Título del testimonio',
    example: 'Experiencia increíble con Producto X' 
  })
  titulo: string;

  @ApiProperty({ 
    description: 'Nombre del autor del testimonio',
    example: 'María González' 
  })
  autor: string;

  @ApiProperty({ 
    description: 'Empresa del autor',
    example: 'Innovatech Solutions',
    required: false 
  })
  empresa?: string;

  @ApiProperty({ 
    description: 'Cargo del autor',
    example: 'Directora de Marketing',
    required: false 
  })
  cargo?: string;

  @ApiProperty({ 
    description: 'Contenido del testimonio',
    example: 'Este servicio superó todas mis expectativas...' 
  })
  contenido: string;

  @ApiProperty({ 
    description: 'Estado del testimonio',
    enum: TestimonialStatus,
    example: 'pending' 
  })
  status: TestimonialStatus;

  @ApiProperty({ 
    description: 'URL de video externo (YouTube, Vimeo, etc.)',
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
    type: () => MultimediaResponseDto,
    required: false 
  })
  multimedia?: MultimediaResponseDto;

  @ApiProperty({ 
    description: 'Fecha de creación',
    example: '2025-12-02T14:11:54.402Z' 
  })
  creadoEn: Date;

  @ApiProperty({ 
    description: 'Fecha de última actualización',
    example: '2025-12-02T14:11:59.679Z' 
  })
  actualizadoEn: Date;
}

// DTO principal para respuestas GET (uno solo)
export class TestimonialResponseDto {
  @ApiProperty({ 
    description: 'Datos del testimonio',
    type: () => TestimonialDataDto 
  })
  testimonial: TestimonialDataDto;
}

// DTO para respuestas POST/PATCH (puede incluir multimedia separada)
export class CreateTestimonialResponseDto {
  @ApiProperty({ 
    description: 'Datos del testimonio',
    type: () => TestimonialDataDto 
  })
  testimonial: TestimonialDataDto;

  @ApiProperty({ 
    description: 'Multimedia creada (si se subió archivo)',
    type: () => MultimediaResponseDto,
    required: false 
  })
  multimedia?: MultimediaResponseDto;
}

// DTO para respuestas de lista
export class TestimonialsListResponseDto {
  @ApiProperty({ 
    description: 'Lista de testimonios',
    type: [TestimonialDataDto] 
  })
  testimonials: TestimonialDataDto[];

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