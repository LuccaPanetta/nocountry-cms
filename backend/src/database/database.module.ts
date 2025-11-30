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
    // Esperar a que TypeORM se inicialice completamente
    setTimeout(() => {
      this.initializeSeeding();
    }, 5000);
  }

  private async initializeSeeding() {
    try {
      console.log('🚀 Iniciando proceso de seeding...');
      
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment) {
        console.log('🔧 MODO DESARROLLO: Las tablas se crean automáticamente');
        await this.developmentSeeding();
      } else {
        console.log('🚀 MODO PRODUCCIÓN: Verificando estado de la base de datos');
        await this.productionSeeding();
      }
      
      console.log('✅ Proceso de seeding completado');
    } catch (error) {
      console.error('❌ Error en el proceso de seeding:', error);
    }
  }

  private async developmentSeeding() {
    try {
      // En desarrollo, las tablas se crean automáticamente por synchronize: true
      console.log('⏳ Esperando creación de tablas...');
      await this.waitForTables();
      
      console.log('🌱 Ejecutando seeds...');
      await this.executeAllSeeds();
      
    } catch (error) {
      console.error('❌ Error en desarrollo:', error);
    }
  }

  private async productionSeeding() {
    try {
      // En producción, verificamos si las tablas existen
      const tablesExist = await this.checkIfTablesExist();
      
      if (!tablesExist) {
        console.log('⚠️  Las tablas no existen en producción. Seeding omitido.');
        console.log('💡 SOLUCIÓN: Ejecuta migraciones o habilita synchronize temporalmente');
        return;
      }
      
      console.log('🌱 Ejecutando seeds en producción...');
      await this.executeAllSeeds();
      
    } catch (error) {
      console.error('❌ Error en producción:', error);
    }
  }

  private async executeAllSeeds() {
    try {
      await this.usersSeed.seed();
      await this.tagsCategoriesSeed.seed();
      await this.testimonialsSeed.seed();
      console.log('🎉 Todos los seeds ejecutados correctamente');
    } catch (error) {
      console.error('❌ Error ejecutando seeds:', error);
    }
  }

  private async waitForTables(maxAttempts = 15): Promise<boolean> {
    console.log('⏳ Esperando creación de tablas...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const tablesExist = await this.checkIfTablesExist();
      
      if (tablesExist) {
        console.log('✅ Tablas creadas correctamente');
        return true;
      }
      
      console.log(`📊 Intento ${attempt}/${maxAttempts}: Esperando tablas...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('❌ Timeout: Las tablas no se crearon');
    return false;
  }

  private async checkIfTablesExist(): Promise<boolean> {
    try {
      const tables = ['users', 'tags', 'categories', 'testimonials'];
      let existingTables = 0;
      
      for (const table of tables) {
        const exists = await this.checkIfTableExists(table);
        if (exists) {
          existingTables++;
          console.log(`✅ ${table}`);
        } else {
          console.log(`❌ ${table}`);
        }
      }
      
      console.log(`📊 ${existingTables}/${tables.length} tablas existentes`);
      return existingTables === tables.length;
      
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