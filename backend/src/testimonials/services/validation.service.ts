// src/testimonials/services/validation.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { MultimediaType } from '../../multimedia/enums/multimedia-type.enum';

@Injectable()
export class TestimonialValidationService {
  
  validateFileAndUrl(file?: Express.Multer.File, multimediaUrl?: string): void {
    if (file && multimediaUrl) {
      throw new BadRequestException(
        'No se puede enviar tanto archivo como URL externa. Elige solo una opción.'
      );
    }
  }

  validateStatusNotAllowed(body: any): void {
    if ('status' in body && body.status !== undefined) {
      throw new BadRequestException(
        'El campo "status" no se puede actualizar en esta ruta. ' +
        'Use la ruta PATCH /testimonials/:id/status para cambiar el estado.'
      );
    }
  }

  validateMultimediaType(tipo: any): MultimediaType {
    if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo)) {
      throw new BadRequestException(`Tipo de archivo no válido: ${tipo}`);
    }
    return tipo;
  }

  determineFileType(file: Express.Multer.File, tipo?: MultimediaType): MultimediaType {
    return tipo || (file.mimetype.startsWith('image/') 
      ? MultimediaType.IMAGE 
      : MultimediaType.VIDEO);
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  determineTipoPorUrl(url: string): MultimediaType {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || 
        urlLower.includes('youtu.be') || 
        urlLower.includes('vimeo.com') ||
        urlLower.includes('video') ||
        urlLower.endsWith('.mp4') || 
        urlLower.endsWith('.mov') || 
        urlLower.endsWith('.avi')) {
      return MultimediaType.VIDEO;
    }
    
    return MultimediaType.IMAGE;
  }
}