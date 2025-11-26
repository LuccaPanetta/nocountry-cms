import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  create(@Body() createTestimonialDto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.create(createTestimonialDto, req.user);
  }

  @Get()
  findAll(@Query() filterDto: GetTestimonialsDto) {
    return this.testimonialsService.findAll(filterDto);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id); 
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  update(@Param('id') id: string, @Body() updateTestimonialDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id); 
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.testimonialsService.updateStatus(id, updateStatusDto.status);
  }
}