// multimedia/multimedia.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaController } from './multimedia.controller';
import { CloudinaryMediaService } from './../cloudinary/cloudinary-media.service'; // ✅ Ruta correcta
import { Multimedia } from './entities/multimedia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Multimedia]),
  ],
  controllers: [MultimediaController],
  providers: [CloudinaryMediaService], // ✅ Proveer el servicio
  exports: [CloudinaryMediaService], // ✅ Exportar si es necesario
})
export class MultimediaModule {}