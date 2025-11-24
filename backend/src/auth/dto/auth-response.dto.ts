// src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserAuthResponseDto {
  @ApiProperty({
    example: '97e62deb-242d-4422-ac0a-1948997352bf',
    description: 'ID único del usuario'
  })
  id: string;

  @ApiProperty({
    example: 'contributor@dominio.com',
    description: 'Email del usuario'
  })
  email: string;

  @ApiProperty({
    example: 'Jorge',
    description: 'Nombre del usuario'
  })
  nombre: string;

  @ApiProperty({
    example: 'Rodríguez',
    description: 'Apellido del usuario'
  })
  apellido: string;

  @ApiProperty({
    example: 'contributor',
    description: 'Rol del usuario',
    enum: ['admin', 'editor', 'contributor']
  })
  rol: string;
}

export class AuthResponseDto {
  @ApiProperty({
    type: UserAuthResponseDto,
    description: 'Información del usuario autenticado'
  })
  user: UserAuthResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5N2U2MmRlYi0yNDJkLTQ0MjItYWMwYS0xOTQ4OTk3MzUyYmYiLCJlbWFpbCI6ImRlbG1lcjEyQGV4YW1wbGUuY29tIiwicm9sIjoiY29udHJpYnV0b3IiLCJpYXQiOjE3NjM5OTQ3NDIsImV4cCI6MTc2Mzk5ODM0Mn0.z45HQcys6McotKuze4cCFlYyVANoOB0baod7VxUqq-Q',
    description: 'Token de acceso JWT para autenticación'
  })
  access_token: string;
}