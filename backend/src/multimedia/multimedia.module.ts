// src/multimedia/multimedia.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ AGREGAR ESTO
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaController } from '../multimedia/multimedia.controller';
import { CloudinaryMediaService } from '../cloudinary/cloudinary-media.service';
import { Multimedia } from '../multimedia/entities/multimedia.entity';

@Module({
  imports: [
    ConfigModule, // ✅ AGREGAR PARA ACCEDER A VARIABLES DE ENTORNO
    TypeOrmModule.forFeature([Multimedia]),
  ],
  controllers: [MultimediaController],
  providers: [CloudinaryMediaService],
  exports: [CloudinaryMediaService],
})
export class MultimediaModule {}