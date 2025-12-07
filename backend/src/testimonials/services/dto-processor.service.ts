// src/testimonials/services/dto-processor.service.ts
import { Injectable } from '@nestjs/common';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';

@Injectable()
export class TestimonialDtoProcessorService {
  
  prepareMultimediaData(
    file?: Express.Multer.File,
    tipo?: MultimediaType,
    descripcion?: string,
    multimediaUrl?: string
  ): { tipo: MultimediaType; descripcion?: string } | undefined {
   if (file) {
      return {
        tipo: tipo || (file.mimetype.startsWith('image/') 
          ? MultimediaType.IMAGE 
          : MultimediaType.VIDEO),
        descripcion: descripcion || file.originalname
      };
    }
    
    // Si hay URL pero NO archivo, preparar datos para URL
    if (multimediaUrl && !file) {
      // Si no viene el tipo, intentamos deducirlo de la URL
      let tipoDeducido: MultimediaType = tipo || MultimediaType.IMAGE;
      
      if (multimediaUrl.toLowerCase().includes('youtube.com') || 
          multimediaUrl.toLowerCase().includes('youtu.be') || 
          multimediaUrl.toLowerCase().includes('vimeo.com')) {
        tipoDeducido = MultimediaType.VIDEO;
      }
      
      return {
        tipo: tipoDeducido,
        descripcion: descripcion || 'URL externa de multimedia'
      };
    }
    
    // Si no hay ni archivo ni URL
    return undefined;
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