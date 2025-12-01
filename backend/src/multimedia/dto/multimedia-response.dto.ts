// src/multimedia/dto/multimedia-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { MultimediaType } from '../enums/multimedia-type.enum';

export class MultimediaResponseDto {
  @ApiProperty({
    description: 'ID único del multimedia',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    enum: MultimediaType,
    description: 'Tipo de archivo multimedia',
    example: MultimediaType.IMAGE
  })
  tipo: MultimediaType;

  @ApiProperty({
    description: 'URL del archivo en Cloudinary',
    example: 'https://res.cloudinary.com/tu-cloud/image/upload/v123/testimonios/abc123/image.jpg'
  })
  url: string;

  @ApiProperty({
    description: 'Descripción opcional del archivo',
    example: 'Imagen principal del testimonio',
    required: false,
    nullable: true
  })
  descripcion?: string;

  @ApiProperty({
    description: 'ID público en Cloudinary',
    example: 'testimonios/abc123/image_xyz',
    required: false,
    nullable: true
  })
  publicId?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-30T12:00:00.000Z'
  })
  creadoEn: Date;

  @ApiProperty({
    description: 'Nombre original del archivo',
    example: 'testimonio-foto.jpg',
    required: false,
    nullable: true
  })
  nombreArchivo?: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-30T12:00:00.000Z',
    required: false
  })
  actualizadoEn?: Date;
}