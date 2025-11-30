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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Testimonial, Tag, Category])
  ],
  providers: [
    UsersSeed, 
    TestimonialsSeed, 
    TagsCategoriesSeed,
  ],
  exports: [UsersSeed, TestimonialsSeed, TagsCategoriesSeed],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly usersSeed: UsersSeed,
    private readonly testimonialsSeed: TestimonialsSeed,
    private readonly tagsCategoriesSeed: TagsCategoriesSeed,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      console.log('🗄️ Iniciando inicialización de base de datos...');
      
      // 1. ✅ EJECUTAR MIGRACIONES DE FORMA EXPLÍCITA
      await this.runMigrations();
      
      // 2. ✅ Pequeña pausa para asegurar que las migraciones se completen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. ✅ LUEGO: Ejecutar seeding
      await this.executeSeeding();
      
      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error durante la inicialización de la base de datos:', error);
      // No relanzar el error para que la aplicación pueda iniciar
    }
  }

  private async runMigrations() {
    try {
      console.log('🔄 Ejecutando migraciones...');
      
      // Verificar si hay migraciones pendientes
      const hasPendingMigrations = await this.dataSource.showMigrations();
      
      if (!hasPendingMigrations) {
        console.log('✅ No hay migraciones pendientes');
        return;
      }

      console.log('📦 Ejecutando migraciones pendientes...');
      const executedMigrations = await this.dataSource.runMigrations();
      
      if (executedMigrations && executedMigrations.length > 0) {
        console.log(`✅ Migraciones ejecutadas: ${executedMigrations.length}`);
        executedMigrations.forEach(migration => {
          console.log(`   - ${migration.name}`);
        });
      } else {
        console.log('✅ No se ejecutaron migraciones (ya estaban aplicadas)');
      }
      
    } catch (error) {
      console.error('❌ Error ejecutando migraciones:', error);
      // En producción, es mejor continuar aunque falle las migraciones
    }
  }

  private async executeSeeding() {
    try {
      console.log('🌱 Iniciando proceso de seeding...');
      
      // Verificar que las tablas principales existen antes de hacer seeding
      const tablesExist = await this.checkEssentialTables();
      
      if (!tablesExist) {
        console.log('⚠️ Las tablas esenciales no existen. Saltando seeding...');
        return;
      }
      
      // Orden correcto de ejecución
      await this.usersSeed.seed();
      await this.tagsCategoriesSeed.seed(); 
      await this.testimonialsSeed.seed();
      
      console.log('✅ Seeding completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el seeding:', error);
    }
  }

  private async checkEssentialTables(): Promise<boolean> {
    try {
      const essentialTables = ['users', 'tags', 'categories', 'testimonials'];
      
      for (const table of essentialTables) {
        const exists = await this.checkIfTableExists(table);
        if (!exists) {
          console.log(`⚠️ Tabla ${table} no existe`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error verificando tablas:', error);
      return false;
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
}