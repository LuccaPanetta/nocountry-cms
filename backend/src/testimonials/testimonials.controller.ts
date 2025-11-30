// src/testimonials/testimonials.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateStatusDto } from './dto/update-status.dto'; 

import {
  TestimonialsSwagger,
  CreateTestimonialSwagger,
  FindAllTestimonialsSwagger,
  FindOneTestimonialSwagger,
  UpdateTestimonialSwagger,
  DeleteTestimonialSwagger,
  UpdateStatusSwagger
} from './decorators';

// ✅ Importa los decoradores de roles y permisos
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { Public } from '../auth/decorators/public.decorator'; 

@TestimonialsSwagger()
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @CreateTestimonialSwagger()
  @Roles(UserRole.CONTRIBUTOR)
  create(@Body() createTestimonialDto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.create(createTestimonialDto, req.user);
  }

  @Get()
  @FindAllTestimonialsSwagger()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  findAll(@Query() filterDto: GetTestimonialsDto, @Request() req) {
    return this.testimonialsService.findAll(filterDto, req.user);
  }
  
  @Get(':id')
  @FindOneTestimonialSwagger()
  @Public()
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id); 
  }

  @Patch(':id')
  @UpdateTestimonialSwagger()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTestimonialDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }
  
  @Delete(':id')
  @DeleteTestimonialSwagger()
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id); 
  }

  @Patch(':id/status')
  @UpdateStatusSwagger()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.testimonialsService.updateStatus(id, updateStatusDto.status);
  }
}