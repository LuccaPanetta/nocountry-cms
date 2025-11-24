import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty({ description: 'Contenido principal del testimonio' })
  @IsString({ message: 'El contenido debe ser texto' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  content: string;

  @ApiProperty({ description: 'Nombre del autor (cliente)', required: false })
  @IsString({ message: 'El nombre del autor debe ser texto' })
  @IsOptional()
  authorName?: string;

  @ApiProperty({ description: 'URL del video de YouTube (opcional)', required: false })
  @IsUrl({}, { message: 'La URL debe ser válida' })
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ description: 'URL de la imagen (Cloudinary, opcional)', required: false })
  @IsUrl({}, { message: 'La URL debe ser válida' })
  @IsOptional()
  imageUrl?: string;
}
