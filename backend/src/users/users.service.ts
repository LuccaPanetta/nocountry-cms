import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; // Necesario para el método update

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ------------------------------------------
  // CREATE
  // ------------------------------------------
  async create(dto: CreateUserDto) {
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (exists) throw new BadRequestException('Email ya registrado');

    const user = this.userRepository.create({
      ...dto,
      password: dto.password, 
    });

    return this.userRepository.save(user);
  }

  // ------------------------------------------
  // FIND ALL
  // ------------------------------------------
  async findAll() {
    return this.userRepository.find();
  }

  // ------------------------------------------
  // FIND ONE
  // ------------------------------------------
  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return user;
  }

  // ------------------------------------------
  // FIND BY EMAIL
  // ------------------------------------------
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  // ------------------------------------------
  // UPDATE
  // ------------------------------------------
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);

    return this.userRepository.save(user);
  }

  // ------------------------------------------
  // REMOVE
  // ------------------------------------------
  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'Usuario eliminado' };
  }
}