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

@UsersSwagger()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CreateUserSwagger()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @FindAllUsersSwagger()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @FindOneUserSwagger()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UpdateUserSwagger()
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @DeleteUserSwagger()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}