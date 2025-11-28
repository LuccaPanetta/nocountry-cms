// multimedia/multimedia.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaController } from '../multimedia/multimedia.controller';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service'; // ✅ Importar el servicio
import { Multimedia } from '../multimedia/entities/multimedia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Multimedia]), // ✅ Solo Multimedia, no Testimonial
  ],
  controllers: [MultimediaController],
  providers: [CloudinaryMediaService], // ✅ Proveer CloudinaryMediaService
  exports: [CloudinaryMediaService], // ✅ Exportar si otros módulos lo necesitan
})
export class MultimediaModule {}