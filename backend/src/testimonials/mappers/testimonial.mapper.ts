// src/testimonials/mappers/testimonial.mapper.ts
import { Testimonial } from '../entities/testimonial.entity';
import { Multimedia } from '../../multimedia/entities/multimedia.entity';
import { 
  TestimonialResponseDto, 
  MultimediaResponseDto, 
  CreateTestimonialResponseDto 
} from '../dto/testimonial-response.dto';

export class TestimonialMapper {
  static toResponseDto(testimonial: Testimonial): TestimonialResponseDto {
    const dto = new TestimonialResponseDto();
    
    // Mapear propiedades directas - manejar valores undefined
    dto.id = testimonial.id;
    dto.titulo = testimonial.titulo || ''; // Valor por defecto si es undefined
    dto.autor = testimonial.autorNombre || ''; // Valor por defecto si es undefined
    dto.empresa = testimonial.empresa || undefined; // Mantener como undefined si es null/empty
    dto.cargo = testimonial.cargo || undefined; // Mantener como undefined si es null/empty
    dto.contenido = testimonial.contenido || ''; // Valor por defecto si es undefined
    dto.status = testimonial.status;
    dto.videoUrl = testimonial.videoUrl || undefined; // Mantener como undefined si es null/empty
    dto.creadoEn = testimonial.creadoEn;
    dto.actualizadoEn = testimonial.actualizadoEn;
    
    // Transformar category de objeto a string - manejar undefined
    dto.category = testimonial.category?.name || '';
    
    // Transformar tags de array de objetos a array de strings - manejar undefined
    dto.tags = testimonial.tags?.map(tag => tag.name).filter(name => name) || [];
    
    // Transformar multimedia si existe
    if (testimonial.multimedia) {
      dto.multimedia = this.toMultimediaResponseDto(testimonial.multimedia);
    }
    
    return dto;
  }

  static toMultimediaResponseDto(multimedia: Multimedia): MultimediaResponseDto {
    const dto = new MultimediaResponseDto();
    
    dto.id = multimedia.id;
    dto.tipo = multimedia.tipo;
    dto.url = multimedia.url || ''; // Valor por defecto si es undefined
    dto.descripcion = multimedia.descripcion || ''; // Valor por defecto si es undefined
    
    return dto;
  }

  static toCreateResponseDto(
    testimonial: Testimonial, 
    multimedia?: Multimedia
  ): CreateTestimonialResponseDto {
    const response: CreateTestimonialResponseDto = {
      testimonial: this.toResponseDto(testimonial),
    };

    // Solo incluir multimedia si existe
    if (multimedia) {
      response.multimedia = this.toMultimediaResponseDto(multimedia);
    } else if (testimonial.multimedia) {
      response.multimedia = this.toMultimediaResponseDto(testimonial.multimedia);
    }
    
    return response;
  }

  // Método adicional para mapear un array de testimonios
  static toResponseDtoArray(testimonials: Testimonial[]): TestimonialResponseDto[] {
    return testimonials.map(testimonial => this.toResponseDto(testimonial));
  }
}