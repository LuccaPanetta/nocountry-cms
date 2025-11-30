// src/database/users.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeed {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    try {
      // ✅ VERIFICAR SI LA TABLA EXISTE
      const tableExists = await this.checkIfTableExists('usuarios');
      if (!tableExists) {
        this.logger.warn('⚠️ La tabla usuarios no existe. Saltando seeding...');
        return;
      }

      this.logger.log('🌱 CREANDO USUARIOS...');

      const users = await this.createUsers();
      await this.userRepository.save(users);

      this.logger.log(`✅ ${users.length} usuarios creados`);
    } catch (error) {
      this.logger.error('❌ Error durante el seeding:', error);
    }
  }

  private async checkIfTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [tableName]
      );
      return result[0].exists;
    } catch (error) {
      return false;
    }
  }

  private async createUsers(): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123!', 10);
    
    const users: Partial<User>[] = [
      // 1 Administrador
      {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@testimonialcms.com',
        rol: UserRole.ADMIN,
        password: hashedPassword,
      },
      // 2 Editores
      {
        nombre: 'Editor',
        apellido: 'Uno',
        email: 'editor@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      {
        nombre: 'Editor',
        apellido: 'Dos', 
        email: 'editor1@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      // 3 Contribuidores
      {
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan.perez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Manuel',
        apellido: 'Gutiérrez',
        email: 'user1@testimonialcms.com', 
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Mabel',
        apellido: 'Martínez',
        email: 'user2@testimonialcms.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
    ];

    return this.userRepository.create(users);
  }
}