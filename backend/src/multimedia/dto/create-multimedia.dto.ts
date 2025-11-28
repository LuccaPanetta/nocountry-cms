import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MultimediaType } from '../enums/multimedia-type.enum';

export class CreateMultimediaDto {
  @ApiProperty({ description: 'ID del testimonio asociado', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  testimonioId: string;

  @ApiProperty({ enum: MultimediaType, description: 'Tipo de multimedia' })
  @IsEnum(MultimediaType)
  @IsNotEmpty()
  tipo: MultimediaType;

  @ApiProperty({ description: 'URL del archivo en Cloudinary', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'ID público en Cloudinary', example: 'testimonials/123/image_abc' })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({ description: 'Descripción del archivo', required: false, example: 'Imagen principal del testimonio' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}