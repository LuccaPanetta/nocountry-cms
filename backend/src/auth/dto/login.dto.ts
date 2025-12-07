import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{6,8}$/;

const PASSWORD_ERROR_MESSAGE =
  'La contraseña debe incluir entre 6 y 8 caracteres, al menos 1 mayúscula y 1 número.';
export class LoginDto {
  @ApiProperty({
    example: 'contributor@dominio.com',
    description: 'Correo electrónico registrado en el sistema',
    format: 'email',
    required: true
  })
 @IsEmail({}, { message: 'Tu correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

@ApiProperty({
    example: 'MiClave1',
    description: 'Contraseña de acceso para el registro',
    minLength: 6,
    maxLength: 8,
    required: true,
    writeOnly: true,
  })
  @IsDefined({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(6, { message: PASSWORD_ERROR_MESSAGE })
  @MaxLength(8, { message: PASSWORD_ERROR_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_ERROR_MESSAGE })
  password: string;
}