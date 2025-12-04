// src/multimedia/multimedia.controller.ts (mantener endpoints de consulta)
import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { MultimediaType } from './enums/multimedia-type.enum';
import { MultimediaService } from './multimedia.service';
import { MultimediaResponseDto } from './dto/multimedia-response.dto';
import {
  MultimediaSwagger,
  ListTestimonioMediaSwagger,
  DeleteMediaSwagger,
  GetMediaUrlsSwagger,
  HealthCheckSwagger,
  CheckConfigSwagger
} from './decorators';

@MultimediaSwagger()
@Controller('multimedia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MultimediaController {
  constructor(
    private readonly multimediaService: MultimediaService  
  ) { }

  /* // ✅ Mantener endpoints de consulta
  @Get('testimonio/:testimonioId')
  @ListTestimonioMediaSwagger()
  async listTestimonioMedia(
    @Param('testimonioId', new ParseUUIDPipe()) testimonioId: string,
    @Query('tipo') tipo?: MultimediaType
  ): Promise<MultimediaResponseDto[]> {
    return this.multimediaService.findByTestimonioIdWithFilter(testimonioId, tipo);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @DeleteMediaSwagger()
  async deleteMedia(
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return this.multimediaService.remove(id);
  }

  @Get('urls/:id')
  @GetMediaUrlsSwagger()
  async getMediaUrls(
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return this.multimediaService.getOptimizedUrls(id);
  }
 */
  @Get('health')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HealthCheckSwagger()
  async healthCheck() {
    return this.multimediaService.healthCheck();
  }

  @Get('config/check')
  @Roles(UserRole.ADMIN)
  @CheckConfigSwagger()
  async checkConfig() {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : undefined,
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : undefined,
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    };

    return {
      services: {
        cloudinary: cloudinaryConfig,
        database: {
          has_url: !!process.env.DATABASE_URL,
          environment: process.env.NODE_ENV
        }
      },
      status: cloudinaryConfig.configured ? '✅ Configurado' : '❌ No configurado',
      message: cloudinaryConfig.configured
        ? 'Todos los servicios están configurados correctamente'
        : 'Verifica las variables de entorno de Cloudinary'
    };
  }
}