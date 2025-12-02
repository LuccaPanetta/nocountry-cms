// src/testimonials/testimonials.controller.ts - VERSIÓN CORREGIDA
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Request, Query, UseInterceptors, UploadedFile, 
  ParseUUIDPipe, BadRequestException, UseGuards,
  UsePipes, ValidationPipe 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialFormDto } from './dto/create-testimonial-form.dto'; // ✅ Nuevo DTO
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TransformFormDataInterceptor } from '../common/interceptors/transform-form-data.interceptor'; // ✅ Interceptor
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
@UseInterceptors(
  FileInterceptor('file'),
  TransformFormDataInterceptor
)
@UsePipes(new ValidationPipe({ 
  transform: true, 
  whitelist: true,
  forbidNonWhitelisted: false
}))
async create(
  @Body() createTestimonialFormDto: CreateTestimonialFormDto,
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any
) {
  console.log('---------------------------------------------------');
  console.log('📥 INICIO: CREATE TESTIMONIAL');
  console.log('📋 DTO crudo recibido (antes de validar):', createTestimonialFormDto);
  console.log('📁 Archivo recibido:', file ? file.originalname : 'Ninguno');
  console.log('👤 Usuario:', req.user?.id);

  try {
    // LOG 1: VALIDACIONES
    console.log('🔎 Validando campos requeridos...');

    if (!createTestimonialFormDto.contenido) {
      console.error('❌ ERROR: contenido es requerido');
      throw new BadRequestException('El campo "contenido" es requerido');
    }

    if (!createTestimonialFormDto.categoryId) {
      console.error('❌ ERROR: categoryId es requerido');
      throw new BadRequestException('El campo "categoryId" es requerido');
    }

    // LOG 2: DETECTANDO TIPO DE MULTIMEDIA
    let multimediaData: { tipo: MultimediaType; descripcion?: string } | undefined;

    if (file) {
      const tipo = createTestimonialFormDto.tipo || 
                   (file.mimetype.startsWith('image/') 
                     ? MultimediaType.IMAGE 
                     : MultimediaType.VIDEO);

      console.log('🎬 Tipo multimedia detectado:', tipo);

      if (![MultimediaType.IMAGE, MultimediaType.VIDEO].includes(tipo)) {
        console.error('❌ ERROR: tipo inválido ->', tipo);
        throw new BadRequestException(`Tipo de archivo no válido: ${tipo}`);
      }

      multimediaData = {
        tipo,
        descripcion: createTestimonialFormDto.descripcion || file.originalname
      };

      console.log('📦 Datos multimedia generados:', multimediaData);
    }

    // LOG 3: TRANSFORMACIÓN DE DTO
    console.log('🔄 Transformando CreateTestimonialFormDto → CreateTestimonialDto...');
    const createTestimonialDto = createTestimonialFormDto.toCreateTestimonialDto();

    console.log('📘 DTO final transformado:', createTestimonialDto);

    // LOG 4: LLAMADO AL SERVICE
    console.log('🚀 Enviando DTO al service...');
    const result = await this.testimonialsService.createWithMedia(
      createTestimonialDto,
      req.user,
      file,
      multimediaData
    );

    console.log('✅ Testimonio creado correctamente');
    console.log('---------------------------------------------------');
    return result;

  } catch (error) {
    console.error('❌ ERROR EN CREATE TESTIMONIAL:', error.message);
    console.error('📌 Stack:', error.stack);
    console.log('---------------------------------------------------');

    throw error; // vuelve a lanzar el error original
  }
}

  // ... resto de métodos permanecen igual
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
  @UseInterceptors(
    FileInterceptor('file'),
    TransformFormDataInterceptor // ✅ También para update
  )
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