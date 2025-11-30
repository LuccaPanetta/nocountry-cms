import { 
  Controller, 
  Post, 
  Delete, 
  Param, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialMediaService } from '../cloudinary/testimonial-media.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Testimonials - Media')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly mediaService: TestimonialMediaService) {}

  // Subir imagen de testimonio
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Subir imagen para testimonio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Subir imagen para testimonio',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, WebP)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagen de testimonio subida exitosamente' 
  })
  async uploadTestimonialImage(
    @Param('id') testimonialId: string,
     @UploadedFile() file: any // ✅ SOLUCIÓN 1
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Validar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Validar tamaño máximo (10MB para imágenes)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Image file too large. Maximum size is 10MB');
    }

    const result = await this.mediaService.uploadTestimonialImage(
      file.buffer,
      testimonialId,
    );

    return {
      message: 'Testimonial image uploaded successfully',
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        thumbnailUrl: this.mediaService.generateTestimonialImageUrl(result.public_id),
      },
    };
  }

  // Subir video de testimonio
  @Post(':id/video')
  @UseInterceptors(FileInterceptor('video'))
  @ApiOperation({ summary: 'Subir video para testimonio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Subir video para testimonio',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de video (MP4, MOV, AVI) - Máximo 100MB',
        },
      },
      required: ['video'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Video de testimonio subido exitosamente' 
  })
  async uploadTestimonialVideo(
    @Param('id') testimonialId: string,
      @UploadedFile() file: any // ✅ SOLUCIÓN 1
  ) {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    // Validar que sea un video
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File must be a video');
    }

    // Validar tamaño máximo (100MB para videos)
    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('Video file too large. Maximum size is 100MB');
    }

    const result = await this.mediaService.uploadTestimonialVideo(
      file.buffer,
      testimonialId,
    );

    return {
      message: 'Testimonial video uploaded successfully',
      data: {
        videoUrl: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
        resourceType: result.resource_type,
        thumbnailUrl: this.mediaService.generateTestimonialVideoThumbnail(result.public_id),
        streamingUrl: this.mediaService.generateTestimonialVideoUrl(result.public_id),
      },
    };
  }
}