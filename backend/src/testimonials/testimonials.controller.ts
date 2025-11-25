import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { UpdateStatusDto } from './dto/update-status.dto'; 
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from 'src/auth/decorators/roles.decorator'; 
import { UserRole } from 'src/users/interfaces/user-role.enum';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  create(@Body() createTestimonialDto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.create(createTestimonialDto, req.user);
  }

  @Get()
  findAll() {
    return this.testimonialsService.findAll();
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id); 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestimonialDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }

  @Patch(':id/status') 
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() { status }: UpdateStatusDto,
  ) {
    return this.testimonialsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id); 
  }
}