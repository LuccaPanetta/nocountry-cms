// src/testimonials/testimonials.controller.ts
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Request, Query, UseInterceptors, UploadedFile, 
  ParseUUIDPipe, UseGuards, UsePipes, ValidationPipe 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TestimonialsService } from './services/testimonials.service';
import { TestimonialValidationService } from './services/validation.service';
import { TestimonialDtoProcessorService } from './services/dto-processor.service';
import { CreateTestimonialFormDto } from './dto/create-testimonial-form.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateTestimonialResponseDto, TestimonialResponseDto } from './dto/testimonial-response.dto';
import { TransformFormDataInterceptor } from '../common/interceptors/transform-form-data.interceptor';
import { TestimonialsSwagger, CreateTestimonialSwagger, FindAllTestimonialsSwagger, 
  FindOneTestimonialSwagger, UpdateTestimonialSwagger, DeleteTestimonialSwagger, 
  UpdateStatusSwagger } from './decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@TestimonialsSwagger()
@Controller('testimonials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly validationService: TestimonialValidationService,
    private readonly dtoProcessorService: TestimonialDtoProcessorService,
  ) {}

  @Post()
  @CreateTestimonialSwagger()
  @Roles(UserRole.CONTRIBUTOR)
  @UseInterceptors(FileInterceptor('file'), TransformFormDataInterceptor)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() createTestimonialFormDto: CreateTestimonialFormDto,
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateTestimonialResponseDto> {
    this.validationService.validateFileAndUrl(file, createTestimonialFormDto.multimediaUrl);
    
    const multimediaData = this.dtoProcessorService.prepareMultimediaData(
      file,
      createTestimonialFormDto.tipo,
      createTestimonialFormDto.descripcion
    );

    const createTestimonialDto = createTestimonialFormDto.toCreateTestimonialDto();
    return await this.testimonialsService.createWithMedia(
      createTestimonialDto,
      req.user,
      file,
      multimediaData
    );
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
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TestimonialResponseDto> {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @UpdateTestimonialSwagger()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'), TransformFormDataInterceptor)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateTestimonialResponseDto> {
    this.validationService.validateFileAndUrl(file, updateTestimonialDto.multimediaUrl);
    this.validationService.validateStatusNotAllowed(updateTestimonialDto);

    const multimediaData = this.dtoProcessorService.prepareMultimediaData(
      file,
      updateTestimonialDto.tipo,
      updateTestimonialDto.descripcion
    );

    this.dtoProcessorService.cleanMultimediaFields(
      updateTestimonialDto,
      !!file,
      !!updateTestimonialDto.multimediaUrl
    );

    return await this.testimonialsService.updateWithMedia(
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
  @UsePipes(new ValidationPipe({ transform: true }))
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ): Promise<TestimonialResponseDto> {
    return this.testimonialsService.updateStatus(id, updateStatusDto.status);
  }
}