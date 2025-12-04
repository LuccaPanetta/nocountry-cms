// src/testimonials/testimonials.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Request, 
  Query, 
  UseInterceptors, 
  UploadedFile, 
  ParseUUIDPipe, 
  BadRequestException, 
  UseGuards,
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialFormDto } from './dto/create-testimonial-form.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { 
  CreateTestimonialResponseDto, 
  TestimonialResponseDto 
} from './dto/testimonial-response.dto';
import { TransformFormDataInterceptor } from '../common/interceptors/transform-form-data.interceptor';
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
  @Request() req: any,
  @UploadedFile() file?: Express.Multer.File, // ✅ Solo agregar '?' aquí
  
): Promise<CreateTestimonialResponseDto> {
  console.log('📥 CREATE TESTIMONIAL - Inicio');
  console.log('📋 DTO recibido:', createTestimonialFormDto);
  console.log('📁 Archivo recibido:', file ? file.originalname : 'Ninguno');

  try {
    // VALIDACIÓN: No permitir file y multimediaUrl al mismo tiempo
    if (file && createTestimonialFormDto.multimediaUrl) {
      console.error('❌ ERROR: No se puede enviar archivo y URL externa simultáneamente');
      throw new BadRequestException(
        'No se puede enviar tanto archivo como URL externa. Elige solo una opción.'
      );
    }

    // Si hay archivo pero no tipo, detectar automáticamente
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
    }

    // Transformar DTO
    const createTestimonialDto = createTestimonialFormDto.toCreateTestimonialDto();

    // Si hay URL pero no archivo, limpiar datos de archivo en el DTO
    if (createTestimonialDto.multimediaUrl && !file) {
      createTestimonialDto.tipo = undefined;
      createTestimonialDto.descripcion = undefined;
    }

    console.log('🚀 Enviando al service...');
    const result = await this.testimonialsService.createWithMedia(
      createTestimonialDto,
      req.user,
      file, // ✅ Ahora puede ser undefined
      multimediaData
    );

    console.log('✅ Testimonio creado correctamente');
    return result;

  } catch (error) {
    console.error('❌ ERROR EN CREATE TESTIMONIAL:', error.message);
    throw error;
  }
}

  @Get()
@FindAllTestimonialsSwagger()
@Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.CONTRIBUTOR)
findAll(
  @Query() filterDto: GetTestimonialsDto, 
  @Request() req: any
): Promise<TestimonialResponseDto[]> {
  return this.testimonialsService.findAll(filterDto, req.user);
}
  
  @Get(':id')
  @FindOneTestimonialSwagger()
  @Public()
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TestimonialResponseDto> {
    return this.testimonialsService.findOne(id);
  }

@Patch(':id')
@UpdateTestimonialSwagger()
@Roles(UserRole.EDITOR, UserRole.ADMIN)
@UseInterceptors(
  FileInterceptor('file'),
  TransformFormDataInterceptor
)
@UsePipes(new ValidationPipe({ 
  transform: true, 
  whitelist: true,
  forbidNonWhitelisted: false, // Cambiado a true para detectar campos no permitidos
  exceptionFactory: (errors) => {
    console.log('❌ Errores de validación:', errors);
    const errorMessages = errors.map(error => ({
      field: error.property,
      value: error.value,
      errors: Object.values(error.constraints || {}).map(message => ({
        code: message.split(' ')[0],
        message
      }))
    }));
    throw new BadRequestException({
      statusCode: 400,
      message: 'Errores de validación en la solicitud',
      errors: errorMessages,
    });
  }
}))
async update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateTestimonialDto: UpdateTestimonialDto,
  @UploadedFile() file?: Express.Multer.File,
  @Request() req?: any
): Promise<CreateTestimonialResponseDto> {
  console.log('✏️ ACTUALIZANDO TESTIMONIO:', id);
  console.log('📋 DTO recibido:', updateTestimonialDto);
  console.log('📁 Archivo recibido:', file ? file.originalname : 'Ninguno');

  try {
    // VALIDACIÓN: No permitir file y multimediaUrl al mismo tiempo
    if (file && updateTestimonialDto.multimediaUrl) {
      console.error('❌ ERROR: No se puede enviar archivo y URL externa simultáneamente');
      throw new BadRequestException(
        'No se puede enviar tanto archivo como URL externa. Elige solo una opción.'
      );
    }

    // VALIDACIÓN: Si se envía status, rechazar la solicitud
    // Esto asegura que status solo se actualice por la ruta específica
    if ('status' in updateTestimonialDto && updateTestimonialDto.status !== undefined) {
      console.error('❌ ERROR: El campo status no se puede actualizar aquí');
      throw new BadRequestException(
        'El campo "status" no se puede actualizar en esta ruta. ' +
        'Use la ruta PATCH /testimonials/:id/status para cambiar el estado.'
      );
    }

    // Preparar datos de multimedia solo si hay archivo
    let multimediaData: { tipo: MultimediaType; descripcion?: string } | undefined;
    
    if (file) {
      const tipo = updateTestimonialDto.tipo || 
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
        descripcion: updateTestimonialDto.descripcion || file.originalname
      };
    }

    // Si hay URL pero no archivo, limpiar datos de archivo en el DTO
    if (updateTestimonialDto.multimediaUrl && !file) {
      updateTestimonialDto.tipo = undefined;
      updateTestimonialDto.descripcion = undefined;
    }

    // También limpiar campos multimedia si no hay ni archivo ni URL
    if (!file && !updateTestimonialDto.multimediaUrl) {
      updateTestimonialDto.tipo = undefined;
      updateTestimonialDto.descripcion = undefined;
    }

    console.log('🚀 Enviando al service...');
    return await this.testimonialsService.updateWithMedia(
      id,
      updateTestimonialDto,
      file,
      multimediaData
    );

  } catch (error) {
    console.error('❌ ERROR EN UPDATE TESTIMONIAL:', error.message);
    throw error;
  }
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
  ): Promise<TestimonialResponseDto> {
    return this.testimonialsService.updateStatus(id, updateStatusDto.status);
  }
}