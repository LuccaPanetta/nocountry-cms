// src/testimonials/testimonials.controller.ts
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Request, Query, UseInterceptors, UploadedFile, 
  ParseUUIDPipe, BadRequestException, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MultimediaType } from '../multimedia/enums/multimedia-type.enum';

@TestimonialsSwagger()
@Controller('testimonials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @CreateTestimonialSwagger()
  @Roles(UserRole.CONTRIBUTOR)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    // Si hay archivo, extraer tipo y descripción del body
    let multimediaData: { tipo: MultimediaType; descripcion?: string } | undefined;
    
    if (file) {
      // Obtener tipo del body o inferirlo del mimetype
      const tipoFromBody = (createTestimonialDto as any).tipo;
      const tipo = tipoFromBody || (file.mimetype.startsWith('image/') 
        ? MultimediaType.IMAGE 
        : MultimediaType.VIDEO);
      
      if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo)) {
        throw new BadRequestException('Tipo de archivo no válido');
      }
      
      multimediaData = {
        tipo,
        descripcion: (createTestimonialDto as any).descripcion || file.originalname
      };
    }

    return this.testimonialsService.createWithMedia(
      createTestimonialDto,
      req.user,
      file,
      multimediaData
    );
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @UpdateTestimonialSwagger()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    let multimediaData: { tipo: MultimediaType; descripcion?: string } | undefined;
    
    if (file) {
      const tipoFromBody = (updateTestimonialDto as any).tipo;
      const tipo = tipoFromBody || (file.mimetype.startsWith('image/') 
        ? MultimediaType.IMAGE 
        : MultimediaType.VIDEO);
      
      multimediaData = {
        tipo,
        descripcion: (updateTestimonialDto as any).descripcion || file.originalname
      };
    }

    return this.testimonialsService.updateWithMedia(
      id,
      updateTestimonialDto,
      file,
      multimediaData
    );
  }
  
  @Delete(':id')
  @DeleteTestimonialSwagger()
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.testimonialsService.remove(id);
  }

  @Patch(':id/status')
  @UpdateStatusSwagger()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.testimonialsService.updateStatus(id, updateStatusDto.status);
  }
}