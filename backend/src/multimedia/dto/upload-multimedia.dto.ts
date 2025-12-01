import { ApiProperty } from '@nestjs/swagger';
import { MultimediaType } from '../enums/multimedia-type.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadMultimediaDto {
  @ApiProperty({
    enum: MultimediaType,
    example: MultimediaType.IMAGE,
    description: 'Tipo de archivo multimedia (IMAGE o VIDEO)'
  })
  @IsEnum(MultimediaType)
  tipo: MultimediaType;

  @ApiProperty({
    description: 'Descripción opcional del archivo multimedia',
    required: false,
    example: 'Imagen principal del testimonio'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}