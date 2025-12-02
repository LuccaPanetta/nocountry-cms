// src/cloudinary/cloudinary.module.ts - ¡CORREGIDO!
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Para variables de entorno
import { CloudinaryMediaService } from './cloudinary-media.service'; // Import relativo

@Module({
  imports: [ConfigModule], // Para acceder a process.env
  providers: [CloudinaryMediaService],
  exports: [CloudinaryMediaService], // Para que otros módulos lo usen
  // ❌ NO TIENE controllers ❌
  // MultimediaController pertenece a MultimediaModule
})
export class CloudinaryModule {}