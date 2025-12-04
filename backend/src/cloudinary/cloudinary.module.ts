// src/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider'; // ✅ Proveedor de configuración
import { CloudinaryMediaService } from './cloudinary-media.service'; // ✅ Tu servicio

@Module({
  imports: [ConfigModule], // Para variables de entorno
  providers: [
    CloudinaryProvider, // ✅ Configura v2() de Cloudinary
    CloudinaryMediaService, // ✅ Tu lógica de negocio
  ],
  exports: [
    CloudinaryProvider, // ✅ Para que otros usen la instancia configurada
    CloudinaryMediaService, // ✅ Para que otros usen tu servicio
  ],
})
export class CloudinaryModule {}