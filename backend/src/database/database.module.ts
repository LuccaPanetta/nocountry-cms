import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersSeed } from './users.seed';
import { TestimonialsSeed } from './testimonials.seed';
import { Testimonial } from 'src/testimonials/entities/testimonial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Testimonial])],
  providers: [UsersSeed, TestimonialsSeed],
  exports: [UsersSeed, TestimonialsSeed],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    private readonly usersSeed: UsersSeed,
    private readonly testimonialsSeed: TestimonialsSeed) {}

  async onModuleInit() {
    // Solo ejecutar seeding en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await this.usersSeed.seed();
       await this.testimonialsSeed.seed();
    }
  }
}