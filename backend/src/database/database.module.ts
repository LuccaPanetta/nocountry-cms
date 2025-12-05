// src/database/database.module.ts (CORREGIDO)
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { Multimedia } from '../multimedia/entities/multimedia.entity'; // ✅ AGREGAR
import { EngagementMetric } from '../engagement/entities/engagement.entity'; // ✅ AGREGAR
import { UsersSeed } from './users.seed';
import { TestimonialsSeed } from './testimonials.seed';
import { TagsCategoriesSeed } from './tags-categories.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Testimonial,
      Tag,
      Category,
      Multimedia, // ✅ AGREGADO
      EngagementMetric, // ✅ AGREGADO
    ])
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
    
    // Esperar un poco más para desarrollo
    setTimeout(() => {
      this.resetAndSeedDatabase();
    }, 10000); // 10 segundos
  }

  private async resetAndSeedDatabase() {
    try {
      console.log('🔄 INICIANDO PROCESO DE RESET Y SEEDING...');
      
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment) {
        console.log('🔧 MODO DESARROLLO: Reset completo activado');
        await this.forceResetDevelopment();
      } else {
        console.log('🚀 MODO PRODUCCIÓN: Reset seguro');
        await this.safeResetProduction();
      }
      
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
        await queryRunner.query('SET session_replication_role = replica;');

        console.log('🗑️  Eliminando tablas...');

        // Orden CORRECTO de eliminación (dependencias primero)
        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "engagement_metrics" CASCADE');
        console.log('✅ engagement_metrics eliminada');

        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "testimonial_tags" CASCADE');
        console.log('✅ testimonial_tags eliminada');

        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "multimedias" CASCADE');
        console.log('✅ multimedias eliminada');

        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "testimonios" CASCADE');
        console.log('✅ testimonios eliminada');

        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "categorias" CASCADE');
        console.log('✅ categorias eliminada');

        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "tags" CASCADE');
        console.log('✅ tags eliminada');

        await this.safeQuery(queryRunner, 'DROP TABLE IF EXISTS "usuarios" CASCADE');
        console.log('✅ usuarios eliminada');

        await queryRunner.query('SET session_replication_role = DEFAULT;');

        console.log('🗑️  TODAS LAS TABLAS ELIMINADAS');

        // Forzar sincronización
        console.log('🔄 Sincronizando esquema...');
        await this.dataSource.synchronize();
        console.log('✅ Esquema sincronizado - Tablas recreadas');

      } catch (error) {
        console.error('❌ Error durante el reset:', error);
      } finally {
        await queryRunner.release();
      }

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

        // Orden CORRECTO de eliminación (dependencias primero)
        await this.safeQuery(queryRunner, 'DELETE FROM "engagement_metrics"');
        console.log('✅ engagement_metrics limpiada');

        await this.safeQuery(queryRunner, 'DELETE FROM "testimonial_tags"');
        console.log('✅ testimonial_tags limpiada');

        await this.safeQuery(queryRunner, 'DELETE FROM "multimedias"');
        console.log('✅ multimedias limpiada');

        await this.safeQuery(queryRunner, 'DELETE FROM "testimonios"');
        console.log('✅ testimonios limpiada');

        await this.safeQuery(queryRunner, 'DELETE FROM "categorias"');
        console.log('✅ categorias limpiada');

        await this.safeQuery(queryRunner, 'DELETE FROM "tags"');
        console.log('✅ tags limpiada');

        await this.safeQuery(queryRunner, 'DELETE FROM "usuarios"');
        console.log('✅ usuarios limpiada');

        // Reiniciar secuencias
        const sequences = [
          'usuarios_id_seq',
          'tags_id_seq', 
          'categorias_id_seq',
          'testimonios_id_seq'
        ];

        for (const sequence of sequences) {
          await this.safeQuery(queryRunner, `ALTER SEQUENCE ${sequence} RESTART WITH 1`);
        }

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

  private async waitForTables(maxAttempts = 30): Promise<boolean> {
    console.log('⏳ ESPERANDO QUE LAS TABLAS ESTÉN LISTAS...');
    
    const tablesToCheck = [
      { name: 'usuarios', entity: 'User' },
      { name: 'tags', entity: 'Tag' },
      { name: 'categorias', entity: 'Category' },
      { name: 'testimonios', entity: 'Testimonial' },
      { name: 'multimedias', entity: 'Multimedia' },
      { name: 'engagement_metrics', entity: 'EngagementMetric' },
      { name: 'testimonial_tags', entity: 'TestimonialTags' }
    ];
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`📊 Intento ${attempt}/${maxAttempts}: Verificando tablas...`);
      
      let allTablesReady = true;
      
      for (const table of tablesToCheck) {
        const exists = await this.checkIfTableExists(table.name);
        if (exists) {
          console.log(`   ✅ ${table.entity} → ${table.name}`);
        } else {
          console.log(`   ❌ ${table.entity} → ${table.name}`);
          allTablesReady = false;
        }
      }
      
      if (allTablesReady) {
        console.log('✅ TODAS LAS TABLAS ESTÁN LISTAS');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('❌ TIMEOUT: Algunas tablas no están listas después del reset');
    return false;
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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

    console.log('\n🎉 SEEDS COMPLETADOS EXITOSAMENTE');
  }
}