// multimedia/dto/create-multimedia.dto.ts
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MultimediaType } from '../enums/multimedia-type.enum';

export class CreateMultimediaDto {
  @IsUUID()
  testimonioId: string;

  @IsEnum(MultimediaType)
  tipo: MultimediaType;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  publicId?: string;

  @IsString()
  @IsOptional()
  nombreArchivo?: string;

  @IsOptional()
  tamaño?: number;

  @IsString()
  @IsOptional()
  formato?: string;

  @IsOptional()
  duracion?: number;

  @IsString()
  @IsOptional()
  resolucion?: string;
}