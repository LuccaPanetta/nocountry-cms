// src/database/users.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeed {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    try {
      // Verificar si ya existen usuarios
      const userCount = await this.userRepository.count().catch(() => 0);
      
      if (userCount > 0) {
        this.logger.log('✅ Ya existen usuarios. Saltando seeding...');
        return;
      }

      this.logger.log('🌱 Creando usuarios...');

      const users = await this.createUsers();
      await this.userRepository.save(users);

      this.logger.log(`✅ ${users.length} usuarios creados`);
    } catch (error) {
      this.logger.error('❌ Error creando usuarios:', error);
    }
  }

  private async createUsers(): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123!', 10);
    
    const users: Partial<User>[] = [
      // Administrador
      {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@testimonialcms.com',
        rol: UserRole.ADMIN,
        password: hashedPassword,
      },
      // Editores
      {
        nombre: 'Editor',
        apellido: 'Uno',
        email: 'editor1@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      {
        nombre: 'Editor',
        apellido: 'Dos',
        email: 'editor2@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      // Contribuidores
      {
        nombre: 'Usuario',
        apellido: 'Uno',
        email: 'user1@testimonialcms.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Usuario',
        apellido: 'Dos',
        email: 'user2@testimonialcms.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
    ];

    return this.userRepository.create(users);
  }
}