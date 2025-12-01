// src/multimedia/multimedia.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaController } from './multimedia.controller';
import { ConfigModule } from '@nestjs/config';
import { MultimediaService } from './multimedia.service';
import { Multimedia } from './entities/multimedia.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Multimedia, Testimonial])
  ],
  controllers: [MultimediaController],
  providers: [MultimediaService, CloudinaryMediaService],
  exports: [MultimediaService]
})
export class MultimediaModule {}