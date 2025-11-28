// multimedia.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaController } from './multimedia.controller';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service';
import { Multimedia } from './entities/multimedia.entity'; // Añade esta importación

@Module({
  imports: [
    TypeOrmModule.forFeature([Multimedia]), // Añade esta línea
  ],
  controllers: [MultimediaController],
  providers: [CloudinaryMediaService],
  exports: [CloudinaryMediaService],
})
export class MultimediaModule {}