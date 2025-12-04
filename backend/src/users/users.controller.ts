import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './interfaces/user-role.enum';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiParam 
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Crear usuario de rol Operador o Administrador',
    description: 'Crea un nuevo usuario en el sistema (solo administradores)'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'María',
        apellido: 'García',
        email: 'maria@ejemplo.com',
        role: 'OPERATOR', 
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos del usuario inválidos' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email ya está registrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Se requieren permisos de administrador' 
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR) 
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios',
    description: 'Retorna una lista paginada de todos los usuarios del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            nombre: 'María',
            apellido: 'García',
            email: 'maria@ejemplo.com',
            role: 'OPERATOR',
            createdAt: '2024-01-15T10:30:00.000Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Permisos insuficientes' 
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTRIBUTOR)
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Retorna la información detallada de un usuario específico'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'María',
        apellido: 'García',
        email: 'maria@ejemplo.com',
        role: 'OPERATOR',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Permisos insuficientes' 
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario existente (solo administradores)'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario a actualizar',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nombre: 'María Elena',
        apellido: 'García López',
        email: 'maria@ejemplo.com',
        role: 'OPERATOR',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T11:45:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de actualización inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - Se requieren permisos de administrador' 
  })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina permanentemente un usuario del sistema (solo administradores)'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        message: 'Usuario eliminado correctamente',
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Prohibido - No puedes eliminar tu propio usuario o permisos insuficientes' 
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}