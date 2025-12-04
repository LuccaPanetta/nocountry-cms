import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Ana María',
    description: 'Nuevo nombre del usuario',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  nombre?: string;

  @ApiProperty({
    example: 'Gómez López',
    description: 'Nuevo apellido del usuario',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto' })
  apellido?: string;

  @ApiProperty({
    example: 'NuevaPassword123',
    description: 'Nueva contraseña de acceso',
    minLength: 6,
    required: false,
    writeOnly: true
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @ApiProperty({
    example: 'OPERATOR',
    description: 'Nuevo rol del usuario',
    enum: ['ADMIN', 'OPERATOR', 'CONTRIBUTOR'],
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser texto' })
  rol?: string; 
}