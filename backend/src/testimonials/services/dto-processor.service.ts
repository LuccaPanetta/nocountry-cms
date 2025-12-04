// src/testimonials/services/dto-processor.service.ts
import { Injectable } from '@nestjs/common';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';

@Injectable()
export class TestimonialDtoProcessorService {
  
  prepareMultimediaData(
    file?: Express.Multer.File,
    tipo?: MultimediaType,
    descripcion?: string
  ): { tipo: MultimediaType; descripcion?: string } | undefined {
    if (!file) return undefined;

    return {
      tipo: tipo || (file.mimetype.startsWith('image/') 
        ? MultimediaType.IMAGE 
        : MultimediaType.VIDEO),
      descripcion: descripcion || file.originalname
    };
  }

  cleanMultimediaFields(
    dto: UpdateTestimonialDto,
    hasFile: boolean,
    hasUrl: boolean
  ): void {
    if (!hasFile && !hasUrl) {
      dto.tipo = undefined;
      dto.descripcion = undefined;
    } else if (hasUrl && !hasFile) {
      dto.tipo = undefined;
      dto.descripcion = undefined;
    }
  }
}