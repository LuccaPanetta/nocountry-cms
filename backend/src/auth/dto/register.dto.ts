import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,  
  Equals,   
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{6,8}$/;
const PASSWORD_RULES_MESSAGE = 'Debe incluir entre 6 y 8 caracteres, y al menos: 1 mayúscula, y 1 número';

export class RegisterDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' }) 
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    minLength: 3, 
    maxLength: 50,
    required: true,
  })
  @IsString({ message: 'El apellido debe ser texto' })
  @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres' }) 
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @ApiProperty({
    example: 'contributor@dominio.com',
    description: 'Correo electrónico del usuario',
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: 'Tu correo electrónico no es válido' }) 
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'Pass123',
    description: 'Contraseña del usuario (6-8 caracteres, 1 mayús, 1 num)',
    minLength: 6,
    maxLength: 8, 
    required: true,
    writeOnly: true,
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: PASSWORD_RULES_MESSAGE })
  @MaxLength(8, { message: PASSWORD_RULES_MESSAGE })
  
  @Matches(PASSWORD_REGEX, { message: PASSWORD_RULES_MESSAGE })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
  
  @ApiProperty({
    example: 'Pass123',
    description: 'Confirmación de la contraseña',
    required: true,
    writeOnly: true,
  })
  @IsString({ message: 'La confirmación de la contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La confirmación de la contraseña es obligatoria' })
  @Equals('password', { 
    message: 'Las contraseñas ingresadas no coinciden', 
  })
  confirmPassword: string;
}