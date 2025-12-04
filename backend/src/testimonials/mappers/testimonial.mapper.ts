// src/testimonials/mappers/testimonial.mapper.ts
import { Testimonial } from '../entities/testimonial.entity';
import { Multimedia } from '../../multimedia/entities/multimedia.entity';
import { 
  TestimonialDataDto,
  TestimonialResponseDto,
  CreateTestimonialResponseDto,
  TestimonialsListResponseDto,
  MultimediaResponseDto 
} from '../dto/testimonial-response.dto';

export class TestimonialMapper {
  // Mapear a TestimonialDataDto (datos del testimonio)
 static toTestimonialDataDto(testimonial: Testimonial): TestimonialDataDto {
  const dto = new TestimonialDataDto();
  
  dto.id = testimonial.id;
  dto.titulo = testimonial.titulo || '';
  dto.autor = testimonial.autorNombre || '';
  dto.empresa = testimonial.empresa || undefined;
  dto.cargo = testimonial.cargo || undefined;
  dto.contenido = testimonial.contenido || '';
  dto.status = testimonial.status;
  dto.creadoEn = testimonial.creadoEn;
  dto.actualizadoEn = testimonial.actualizadoEn;
  
  dto.category = testimonial.category?.name || '';
  dto.tags = testimonial.tags?.map(tag => tag.name).filter(name => name) || [];
  
  if (testimonial.multimedia) {
    dto.multimedia = this.toMultimediaResponseDto(testimonial.multimedia);
  }
  
  return dto;
}

  static toMultimediaResponseDto(multimedia: Multimedia): MultimediaResponseDto {
    const dto = new MultimediaResponseDto();
    
    dto.id = multimedia.id;
    dto.tipo = multimedia.tipo;
    dto.url = multimedia.url || '';
    dto.descripcion = multimedia.descripcion || '';
    
    return dto;
  }

  // Para respuestas GET (uno solo) - con wrapper testimonial
  static toResponseDto(testimonial: Testimonial): TestimonialResponseDto {
    return {
      testimonial: this.toTestimonialDataDto(testimonial)
    };
  }

  // Para respuestas POST/PATCH - con wrapper testimonial y multimedia separada
  static toCreateResponseDto(
    testimonial: Testimonial, 
    multimedia?: Multimedia
  ): CreateTestimonialResponseDto {
    const response: CreateTestimonialResponseDto = {
      testimonial: this.toTestimonialDataDto(testimonial),
    };

    // Solo incluir multimedia si existe y es diferente de la que ya está en testimonial
    if (multimedia && (!testimonial.multimedia || testimonial.multimedia.id !== multimedia.id)) {
      response.multimedia = this.toMultimediaResponseDto(multimedia);
    }
    
    return response;
  }

  // Para respuestas GET (lista paginada)
  static toListResponseDto(
    testimonials: Testimonial[], 
    total: number = 0,
    page: number = 1,
    limit: number = 10
  ): TestimonialsListResponseDto {
    return {
      testimonials: testimonials.map(testimonial => 
        this.toTestimonialDataDto(testimonial)
      ),
      total,
      page,
      limit
    };
  }
}