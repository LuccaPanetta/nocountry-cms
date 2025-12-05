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
    }, 8000); // Más tiempo para desarrollo
  }

  private async resetAndSeedDatabase() {
    try {
      console.log('🔄 INICIANDO PROCESO DE RESET Y SEEDING...');
      
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment) {
        console.log('🔧 MODO DESARROLLO: Reset completo activado');
        // 1. Resetear usando DROP y CREATE (más efectivo)
        await this.forceResetDevelopment();
      } else {
        console.log('🚀 MODO PRODUCCIÓN: Reset seguro');
        // 2. Resetear usando DELETE (más seguro para producción)
        await this.safeResetProduction();
      }
      
      // 3. Ejecutar seeds
      await this.executeAllSeeds();
      
      console.log('✅ RESET Y SEEDING COMPLETADO EXITOSAMENTE');
    } catch (error) {
      console.error('❌ Error en el proceso de reset y seeding:', error);
    }
  }

 private async forceResetDevelopment() {
  try {
    console.log('💥 RESET COMPLETO (DESARROLLO)...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Deshabilitar triggers temporalmente
      await queryRunner.query('SET session_replication_role = replica;');

      // ELIMINAR en orden correcto (dependencias primero)
      console.log('🗑️  Eliminando tablas...');

      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "testimonial_tags" CASCADE');
      console.log('✅ testimonial_tags eliminada');

      // ⭐ NUEVO: esta tabla dependía de testimonios
      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "engagement_metrics" CASCADE');
      console.log('✅ engagement_metrics eliminada');

      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "testimonios" CASCADE');
      console.log('✅ testimonios eliminada');

      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "multimedias" CASCADE');
      console.log('✅ multimedias eliminada');

      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "categorias" CASCADE');
      console.log('✅ categorias eliminada');

      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "tags" CASCADE');
      console.log('✅ tags eliminada');

      await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "usuarios" CASCADE');
      console.log('✅ usuarios eliminada');

      await queryRunner.query('SET session_replication_role = DEFAULT;');

      console.log('🗑️  TODAS LAS TABLAS ELIMINADAS');

      // Forzar sincronización para recrear tablas
      console.log('🔄 Sincronizando esquema...');
      await this.dataSource.synchronize();
      console.log('✅ Esquema sincronizado - Tablas recreadas');

    } catch (error) {
      console.error('❌ Error durante el reset:', error);
    } finally {
      await queryRunner.release();
    }

    // Esperar a que las tablas estén listas
    await this.waitForTables();

  } catch (error) {
    console.error('❌ Error en forceResetDevelopment:', error);
  }
}


  private async safeResetProduction() {
  try {
    console.log('🛡️  RESET SEGURO (PRODUCCIÓN)...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🗑️  Eliminando registros...');

      await this.safeQuery(queryRunner, 'DELETE FROM "testimonial_tags"');
      console.log('✅ testimonial_tags limpiada');

      // ⭐ NUEVO: limpiar engagement_metrics antes de testimonios
      await this.safeQuery(queryRunner, 'DELETE FROM "engagement_metrics"');
      console.log('✅ engagement_metrics limpiada');

      await this.safeQuery(queryRunner, 'DELETE FROM "testimonios"');
      console.log('✅ testimonios limpiada');

      await this.safeQuery(queryRunner, 'DELETE FROM "multimedias"');
      console.log('✅ multimedias limpiada');

      await this.safeQuery(queryRunner, 'DELETE FROM "categorias"');
      console.log('✅ categorias limpiada');

      await this.safeQuery(queryRunner, 'DELETE FROM "tags"');
      console.log('✅ tags limpiada');

      await this.safeQuery(queryRunner, 'DELETE FROM "usuarios"');
      console.log('✅ usuarios limpiada');

      // Reiniciar secuencias
      await this.safeQuery(queryRunner, 'ALTER SEQUENCE usuarios_id_seq RESTART WITH 1');
      await this.safeQuery(queryRunner, 'ALTER SEQUENCE tags_id_seq RESTART WITH 1');
      await this.safeQuery(queryRunner, 'ALTER SEQUENCE categorias_id_seq RESTART WITH 1');
      await this.safeQuery(queryRunner, 'ALTER SEQUENCE testimonios_id_seq RESTART WITH 1');

      console.log('🔄 Secuencias reiniciadas');

      await queryRunner.commitTransaction();
      console.log('🗑️  TODOS LOS REGISTROS ELIMINADOS');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error durante el reset:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    console.error('❌ Error en safeResetProduction:', error);
  }
}

  private async safeQuery(queryRunner: any, query: string) {
    try {
      await queryRunner.query(query);
      return true;
    } catch (error) {
      console.log(`⚠️  Query ignorado: ${query} - ${error.message}`);
      return false;
    }
  }

  private async waitForTables(maxAttempts = 25): Promise<boolean> {
    console.log('⏳ ESPERANDO QUE LAS TABLAS ESTÉN LISTAS...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const tablesExist = await this.checkIfTablesExist();
      
      if (tablesExist) {
        console.log('✅ TODAS LAS TABLAS ESTÁN LISTAS');
        return true;
      }
      
      console.log(`📊 Intento ${attempt}/${maxAttempts}: Esperando tablas...`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Más tiempo entre intentos
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
    
    // Pequeña pausa para asegurar que todo esté listo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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