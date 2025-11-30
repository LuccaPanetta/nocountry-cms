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

      // ✅ PRIMERO: Limpiar cualquier usuario existente (backup)
      await this.cleanExistingUsers();

      const users = await this.createUsers();
      
      // ✅ INSERTAR con manejo de duplicados
      await this.insertUsersSafely(users);

      this.logger.log(`✅ ${users.length} usuarios procesados`);
    } catch (error) {
      this.logger.error('❌ Error durante el seeding:', error);
    }
  }

  private async cleanExistingUsers() {
    try {
      // Verificar si hay usuarios existentes
      const existingCount = await this.userRepository.count().catch(() => 0);
      
      if (existingCount > 0) {
        this.logger.log(`🗑️  Eliminando ${existingCount} usuarios existentes...`);
        
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        
        try {
          // Deshabilitar temporalmente las constraints
          await queryRunner.query('ALTER TABLE usuarios DISABLE TRIGGER ALL;');
          await queryRunner.query('DELETE FROM usuarios;');
          await queryRunner.query('ALTER TABLE usuarios ENABLE TRIGGER ALL;');
          
          this.logger.log('✅ Usuarios existentes eliminados');
        } finally {
          await queryRunner.release();
        }
      }
    } catch (error) {
      this.logger.warn('⚠️ No se pudieron eliminar usuarios existentes:', error.message);
    }
  }

  private async insertUsersSafely(users: User[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      for (const user of users) {
        try {
          await queryRunner.manager.save(User, user);
          this.logger.log(`✅ Usuario creado: ${user.email}`);
        } catch (error) {
          if (error.code === '23505') { // Violación de unique constraint
            this.logger.warn(`⚠️ Usuario duplicado omitido: ${user.email}`);
          } else {
            this.logger.error(`❌ Error creando usuario ${user.email}:`, error.message);
          }
        }
      }
    } finally {
      await queryRunner.release();
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
        apellido: 'Gomez',
        email: 'manuel.gomez@testimonialcms.com',
        rol: UserRole.CONTRIBUTOR, 
        password: hashedPassword,
      },
      {
        nombre: 'Maria',
        apellido: 'Mendoza',
        email: 'maria.mendoza@testimonialcms.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
    ];

    return this.userRepository.create(users);
  }
}