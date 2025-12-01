// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Testimonial } from '../testimonials/entities/testimonial.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersSeed } from './users.seed';
import { TestimonialsSeed } from './testimonials.seed';
import { TagsCategoriesSeed } from './tags-categories.seed';
import { InitService } from './init.service'; // ← NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Testimonial, Tag, Category])
  ],
  providers: [
    InitService, // ← NUEVO - debe estar PRIMERO
    UsersSeed, 
    TestimonialsSeed, 
    TagsCategoriesSeed,
  ],
  exports: [UsersSeed, TestimonialsSeed, TagsCategoriesSeed],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly initService: InitService, // ← NUEVO
    private readonly usersSeed: UsersSeed,
    private readonly testimonialsSeed: TestimonialsSeed,
    private readonly tagsCategoriesSeed: TagsCategoriesSeed,
  ) {}

  async onModuleInit() {
    console.log('🌱 INICIANDO SEEDING DESPUÉS DE INICIALIZACIÓN...');
    
    // Esperar a que InitService termine
    setTimeout(async () => {
      await this.executeSeedsAfterInit();
    }, 5000);
  }

  private async executeSeedsAfterInit() {
    try {
      // Esperar a que la inicialización esté completa
      let attempts = 0;
      while (attempts < 10) {
        // @ts-ignore - necesitamos verificar el estado interno
        if (this.initService.initialized) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      console.log('🚀 EJECUTANDO SEEDS...');
      await this.executeAllSeeds();
      console.log('✅ SEEDING COMPLETADO EXITOSAMENTE');
      
    } catch (error) {
      console.error('❌ Error en seeding:', error);
    }
  }

  private async executeAllSeeds() {
    // Pequeña pausa para asegurar que TypeORM haya terminado de sincronizar
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
  }
}