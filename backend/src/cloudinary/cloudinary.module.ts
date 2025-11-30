// multimedia/multimedia.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaController } from '../multimedia/multimedia.controller';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service'; 
import { Multimedia } from '../multimedia/entities/multimedia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Multimedia]), 
  ],
  controllers: [MultimediaController],
  providers: [CloudinaryMediaService], 
  exports: [CloudinaryMediaService], 
})
export class MultimediaModule {}