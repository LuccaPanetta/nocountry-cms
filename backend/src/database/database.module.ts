// database/database.module.ts
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
    if (process.env.NODE_ENV !== 'production') {
      // Orden CRÍTICO: primero reset (en usersSeed), luego datos
      await this.usersSeed.seed();
      await this.tagsCategoriesSeed.seed();
      await this.testimonialsSeed.seed();
    }
  }
}