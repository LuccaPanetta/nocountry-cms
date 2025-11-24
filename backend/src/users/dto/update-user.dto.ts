import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Ana María',
    description: 'Nuevo nombre del usuario',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsOptional() // 👈 Campos opcionales para actualización
  nombre?: string;

  @ApiProperty({
    example: 'Gómez López',
    description: 'Nuevo apellido del usuario',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsOptional()
  apellido?: string;

  @ApiProperty({
    example: 'NuevaPassword123',
    description: 'Nueva contraseña de acceso',
    minLength: 6,
    required: false,
    writeOnly: true
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsOptional()
  password?: string;
}