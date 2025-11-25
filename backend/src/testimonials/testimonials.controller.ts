import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { Query } from '@nestjs/common'; 
import { ListTestimonialFilterDto } from './dto/list-testimonial.filter.dto'

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  create(@Body() createTestimonialDto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.create(createTestimonialDto, req.user);
  }

  @Get()
  findAll(@Query() filterDto: ListTestimonialFilterDto) { 
    return this.testimonialsService.findAll(filterDto);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id); 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestimonialDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id); 
  }
}