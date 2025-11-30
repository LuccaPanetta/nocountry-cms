// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UsersSwagger,
  CreateUserSwagger,
  FindAllUsersSwagger,
  FindOneUserSwagger,
  UpdateUserSwagger,
  DeleteUserSwagger
} from './decorators';

// ✅ Importa los decoradores de roles
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './interfaces/user-role.enum';

@UsersSwagger()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CreateUserSwagger()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @FindAllUsersSwagger()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @FindOneUserSwagger()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UpdateUserSwagger()
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @DeleteUserSwagger()
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}