// src/multimedia/dto/multimedia-list-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { MultimediaResponseDto } from './multimedia-response.dto';

export class MultimediaListResponseDto {
  @ApiProperty({
    description: 'Array de archivos multimedia',
    type: [MultimediaResponseDto]
  })
  data: MultimediaResponseDto[];

  @ApiProperty({
    description: 'Total de archivos multimedia',
    example: 5
  })
  total: number;

  @ApiProperty({
    description: 'ID del testimonio',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  testimonioId: string;

  @ApiProperty({
    description: 'Tipo de filtro aplicado (si existe)',
    example: 'IMAGE',
    required: false,
    nullable: true
  })
  filtro?: string;
}