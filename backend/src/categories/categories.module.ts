import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm'; 
=======
import { TypeOrmModule } from '@nestjs/typeorm';
>>>>>>> develop-backend
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';

@Module({
  imports: [
<<<<<<< HEAD
    TypeOrmModule.forFeature([Category]), 
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService, TypeOrmModule.forFeature([Category])], 
=======
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
>>>>>>> develop-backend
})
export class CategoriesModule {}