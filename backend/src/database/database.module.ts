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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Testimonial, Tag, Category])
  ],
  providers: [UsersSeed, TestimonialsSeed, TagsCategoriesSeed],
  exports: [UsersSeed, TestimonialsSeed, TagsCategoriesSeed],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly usersSeed: UsersSeed,
    private readonly testimonialsSeed: TestimonialsSeed,
    private readonly tagsCategoriesSeed: TagsCategoriesSeed,
  ) {}

  async onModuleInit() {
    // ✅ SOLUCIÓN SIMPLE: Siempre ejecutar, pero los seeds son seguros
    await this.executeSeeding();
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