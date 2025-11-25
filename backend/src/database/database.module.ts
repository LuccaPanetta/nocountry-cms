import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersSeed } from './users.seed';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersSeed],
  exports: [UsersSeed],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly usersSeed: UsersSeed) {}

  async onModuleInit() {
    // Solo ejecutar seeding en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await this.usersSeed.seed();
    }
  }
}