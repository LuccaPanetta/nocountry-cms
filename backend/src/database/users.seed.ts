// database/users.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { UserRole } from '../users/interfaces/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeed {
  private readonly logger = new Logger(UsersSeed.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    try {
      // ✅ EN DESARROLLO: Siempre resetear la base de datos
      if (this.isDevelopment) {
        this.logger.log('🔄 Modo desarrollo: Reiniciando base de datos...');
        await this.resetDatabase();
      } else {
        // ✅ EN PRODUCCIÓN: Solo crear si no existen usuarios
        const userCount = await this.userRepository.count();
        if (userCount > 0) {
          this.logger.log('✅ La base de datos ya tiene usuarios. Saltando seeding...');
          return;
        }
      }

      this.logger.log('🌱 Iniciando seeding de usuarios...');

      const users = await this.createUsers();
      await this.userRepository.save(users);

      this.logger.log(`✅ Seeding completado: ${users.length} usuarios creados`);
    } catch (error) {
      this.logger.error('❌ Error durante el seeding:', error);
      throw error;
    }
  }

  private async resetDatabase(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('🗑️  Eliminando todas las tablas con CASCADE...');
      
      // ✅ EL ORDEN ES CRÍTICO: Primero las tablas de unión, luego las dependientes, finalmente las principales
      
      // 1. Primero la tabla de unión ManyToMany (más dependiente)
      await queryRunner.query('TRUNCATE TABLE "testimonial_tags" CASCADE');
      this.logger.log('✅ testimonial_tags truncada');
      
      // 2. Luego las tablas que tienen dependencias
      await queryRunner.query('TRUNCATE TABLE "testimonios" CASCADE');
      this.logger.log('✅ testimonios truncada');
      
      // 3. Finalmente las tablas principales
      await queryRunner.query('TRUNCATE TABLE "categorias" CASCADE');
      this.logger.log('✅ categorias truncada');
      
      await queryRunner.query('TRUNCATE TABLE "tags" CASCADE');
      this.logger.log('✅ tags truncada');
      
      await queryRunner.query('TRUNCATE TABLE "usuarios" CASCADE');
      this.logger.log('✅ usuarios truncada');
      
      await queryRunner.commitTransaction();
      this.logger.log('✅ Todas las tablas reseteadas correctamente');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Error al resetear la base de datos:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ... el resto del código createUsers() permanece igual
  private async createUsers(): Promise<User[]> {
    const hashedPassword = await bcrypt.hash('password123!', 10);
    
    const users: Partial<User>[] = [
      // 1 Administrador
      {
        nombre: 'Verónica',
        apellido: 'Sanchez',
        email: 'admin@testimonialcms.com',
        rol: UserRole.ADMIN,
        password: hashedPassword,
      },
      // 3 Editores
      {
        nombre: 'Juan',
        apellido: 'Diaz',
        email: 'editor@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      {
        nombre: 'Manuel',
        apellido: 'Gutiérrez',
        email: 'editor1@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      {
        nombre: 'Maria',
        apellido: 'Gonzalez',
        email: 'editor2@testimonialcms.com',
        rol: UserRole.EDITOR,
        password: hashedPassword,
      },
      // 10 Contribuidores
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'María',
        apellido: 'García',
        email: 'maria.garcia@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos.lopez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Pedro',
        apellido: 'Rodríguez',
        email: 'pedro.rodriguez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Laura',
        apellido: 'Hernández',
        email: 'laura.hernandez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Miguel',
        apellido: 'Gómez',
        email: 'miguel.gomez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Sofía',
        apellido: 'Díaz',
        email: 'sofia.diaz@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'David',
        apellido: 'Torres',
        email: 'david.torres@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
      {
        nombre: 'Elena',
        apellido: 'Ramírez',
        email: 'elena.ramirez@gmail.com',
        rol: UserRole.CONTRIBUTOR,
        password: hashedPassword,
      },
    ];

    return this.userRepository.create(users);
  }
}