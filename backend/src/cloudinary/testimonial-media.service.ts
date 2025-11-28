import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { UploadVideoDto } from './dto/upload-media.dto';

@Injectable()
export class TestimonialMediaService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // ========== MÉTODOS PARA IMÁGENES ==========

  async uploadTestimonialImage(fileBuffer: Buffer, testimonialId: string) {
    return this.cloudinaryService.uploadImage(fileBuffer, {
      folder: `testimonials/${testimonialId}/images`,
      transformation: {
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto',
        format: 'webp',
      },
      tags: ['testimonial', `testimonial-${testimonialId}`, 'image'],
    });
  }

  async deleteTestimonialImages(testimonialId: string) {
    const folder = `testimonials/${testimonialId}/images`;
    return this.cloudinaryService.purgeImageFolder(folder);
  }

  // ========== MÉTODOS PARA VIDEOS ==========

  async uploadTestimonialVideo(fileBuffer: Buffer, testimonialId: string) {
    const options: UploadVideoDto = {
      folder: `testimonials/${testimonialId}/videos`,
      videoTransformation: {
        width: 1280,
        height: 720,
        crop: 'limit',
        quality: 'auto',
        format: 'mp4',
        audio_codec: 'aac',
        video_codec: 'h264',
        bit_rate: 2500000,
      },
      tags: ['testimonial', `testimonial-${testimonialId}`, 'video'],
    };

    return this.cloudinaryService.uploadVideo(fileBuffer, options);
  }

  async deleteTestimonialVideos(testimonialId: string) {
    const folder = `testimonials/${testimonialId}/videos`;
    return this.cloudinaryService.purgeVideoFolder(folder);
  }

  async deleteAllTestimonialMedia(testimonialId: string) {
    const [imagesResult, videosResult] = await Promise.all([
      this.deleteTestimonialImages(testimonialId),
      this.deleteTestimonialVideos(testimonialId),
    ]);

    return {
      images: imagesResult,
      videos: videosResult,
    };
  }

  // ========== MÉTODOS DE URL GENERATION ==========

  generateTestimonialImageUrl(publicId: string, width: number = 400) {
    return this.cloudinaryService.generateImageUrl(publicId, {
      width,
      crop: 'scale',
      quality: 'auto',
      format: 'webp',
    });
  }

  generateTestimonialVideoUrl(publicId: string, width: number = 640) {
    return this.cloudinaryService.generateVideoUrl(publicId, {
      width,
      crop: 'scale',
      quality: 'auto',
      format: 'mp4',
    });
  }

  generateTestimonialVideoThumbnail(publicId: string, timeOffset: string = '00:00:01') {
    return this.cloudinaryService.generateVideoThumbnail(publicId, timeOffset);
  }

  // ========== MÉTODOS DE FIRMAS PARA UPLOAD DIRECTO ==========

  generateImageUploadSignature(testimonialId: string) {
    return this.cloudinaryService.generateImageUploadSignature(
      `testimonials/${testimonialId}/images`
    );
  }

  generateVideoUploadSignature(testimonialId: string) {
    return this.cloudinaryService.generateVideoUploadSignature(
      `testimonials/${testimonialId}/videos`
    );
  }
}