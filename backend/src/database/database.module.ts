// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersSeed } from './users.seed';
import { TestimonialsSeed } from './testimonials.seed';
import { TagsCategoriesSeed } from './tags-categories.seed';
import { MigrationRunner } from './migration.runner';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Testimonial, Tag, Category])
  ],
  providers: [
    UsersSeed, 
    TestimonialsSeed, 
    TagsCategoriesSeed,
    MigrationRunner
  ],
  exports: [UsersSeed, TestimonialsSeed, TagsCategoriesSeed],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly usersSeed: UsersSeed,
    private readonly testimonialsSeed: TestimonialsSeed,
    private readonly tagsCategoriesSeed: TagsCategoriesSeed,
    private readonly migrationRunner: MigrationRunner,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      console.log('🗄️ Iniciando inicialización de base de datos...');
      
      // 1. ✅ PRIMERO: Ejecutar migraciones
      await this.migrationRunner.runMigrations();
      
      // 2. ✅ LUEGO: Ejecutar seeding
      await this.executeSeeding();
      
      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error durante la inicialización de la base de datos:', error);
      // No relanzar el error para que la aplicación pueda iniciar
    }
  }

  private async executeSeeding() {
    try {
      console.log('🌱 Iniciando proceso de seeding...');
      
      // Orden correcto de ejecución
      await this.usersSeed.seed();
      await this.tagsCategoriesSeed.seed(); 
      await this.testimonialsSeed.seed();
      
      console.log('✅ Seeding completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el seeding:', error);
    }
  }
}