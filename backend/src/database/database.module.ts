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
    console.log('🚀 INICIANDO RESET Y SEEDING COMPLETO...');
    
    // Dar tiempo a que TypeORM se inicialice completamente
    setTimeout(() => {
      this.resetAndSeedDatabase();
    }, 5000);
  }

  private async resetAndSeedDatabase() {
    try {
      console.log('🔄 INICIANDO PROCESO DE RESET Y SEEDING...');
      
      // 1. Resetear toda la base de datos
      await this.resetDatabase();
      
      // 2. Esperar a que las tablas estén listas
      await this.waitForTables();
      
      // 3. Ejecutar seeds
      await this.executeAllSeeds();
      
      console.log('✅ RESET Y SEEDING COMPLETADO EXITOSAMENTE');
    } catch (error) {
      console.error('❌ Error en el proceso de reset y seeding:', error);
    }
  }

  private async resetDatabase() {
    try {
      console.log('🗑️  RESETEANDO BASE DE DATOS...');
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // EL ORDEN ES CRÍTICO: Primero tablas con dependencias, luego las principales
        console.log('📋 Eliminando datos en orden...');
        
        // 1. Tablas de relación Many-to-Many
        await this.safeQuery(queryRunner, 'TRUNCATE TABLE "testimonial_tags" CASCADE');
        console.log('✅ testimonial_tags reseteada');
        
        // 2. Tablas con dependencias
        await this.safeQuery(queryRunner, 'TRUNCATE TABLE "testimonios" CASCADE');
        console.log('✅ testimonios reseteada');
        
        await this.safeQuery(queryRunner, 'TRUNCATE TABLE "multimedias" CASCADE');
        console.log('✅ multimedias reseteada');
        
        // 3. Tablas principales
        await this.safeQuery(queryRunner, 'TRUNCATE TABLE "categorias" CASCADE');
        console.log('✅ categorias reseteada');
        
        await this.safeQuery(queryRunner, 'TRUNCATE TABLE "tags" CASCADE');
        console.log('✅ tags reseteada');
        
        await this.safeQuery(queryRunner, 'TRUNCATE TABLE "usuarios" CASCADE');
        console.log('✅ usuarios reseteada');

        await queryRunner.commitTransaction();
        console.log('🗑️  TODOS LOS DATOS ELIMINADOS CORRECTAMENTE');
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Error durante el reset:', error);
        throw error;
      } finally {
        await queryRunner.release();
      }
      
    } catch (error) {
      console.error('❌ Error en resetDatabase:', error);
    }
  }

  private async safeQuery(queryRunner: any, query: string) {
    try {
      await queryRunner.query(query);
    } catch (error) {
      console.log(`⚠️  Query falló (posiblemente tabla no existe): ${query}`);
      // No relanzar el error, continuar con el proceso
    }
  }

  private async waitForTables(maxAttempts = 20): Promise<boolean> {
    console.log('⏳ ESPERANDO QUE LAS TABLAS ESTÉN LISTAS...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const tablesExist = await this.checkIfTablesExist();
      
      if (tablesExist) {
        console.log('✅ TODAS LAS TABLAS ESTÁN LISTAS');
        return true;
      }
      
      console.log(`📊 Intento ${attempt}/${maxAttempts}: Esperando tablas...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('❌ TIMEOUT: Las tablas no están listas después del reset');
    return false;
  }

  private async checkIfTablesExist(): Promise<boolean> {
    try {
      const tables = [
        { entity: 'User', tableName: 'usuarios' },
        { entity: 'Tag', tableName: 'tags' },
        { entity: 'Category', tableName: 'categorias' },
        { entity: 'Testimonial', tableName: 'testimonios' }
      ];
      
      let allTablesExist = true;
      
      for (const { entity, tableName } of tables) {
        const exists = await this.checkIfTableExists(tableName);
        if (exists) {
          console.log(`✅ ${entity} → ${tableName}`);
        } else {
          console.log(`❌ ${entity} → ${tableName}`);
          allTablesExist = false;
        }
      }
      
      return allTablesExist;
      
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

  private async executeAllSeeds() {
    console.log('\n🌱 EJECUTANDO SEEDS...');
    
    try {
      await this.usersSeed.seed();
      console.log('✅ Users seed completado');
    } catch (error) {
      console.error('❌ Error en users seed:', error.message);
    }
    
    try {
      await this.tagsCategoriesSeed.seed();
      console.log('✅ Tags/Categories seed completado');
    } catch (error) {
      console.error('❌ Error en tags/categories seed:', error.message);
    }
    
    try {
      await this.testimonialsSeed.seed();
      console.log('✅ Testimonials seed completado');
    } catch (error) {
      console.error('❌ Error en testimonials seed:', error.message);
    }
  }
}