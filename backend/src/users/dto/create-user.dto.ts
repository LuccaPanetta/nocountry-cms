import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ana',
    description: 'Nombre del usuario',
    minLength: 2,
    maxLength: 50,
    required: true
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({
    example: 'Gómez',
    description: 'Apellido del usuario',
    minLength: 2,
    maxLength: 50,
    required: true
  })
  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @ApiProperty({
    example: 'ana.gomez@ejemplo.com',
    description: 'Correo electrónico único del usuario',
    format: 'email',
    required: true
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Contraseña de acceso al sistema',
    minLength: 6,
    required: true,
    writeOnly: true
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}