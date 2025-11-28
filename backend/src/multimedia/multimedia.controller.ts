import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum';
import { CloudinaryMediaService, MediaType } from '../cloudinary/cloudinary-media.service';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiConsumes,
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Multimedia')
@ApiBearerAuth('JWT-auth')
@Controller('multimedia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MultimediaController {
  constructor(private readonly mediaService: CloudinaryMediaService) {}

  @Post('upload/:testimonioId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo multimedia para testimonio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        tipo: { enum: [MediaType.IMAGE, MediaType.VIDEO] }
      }
    }
  })
  async uploadMedia(
    @Param('testimonioId') testimonioId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('tipo') tipo: MediaType
  ) {
    if (!file) throw new BadRequestException('No se proporcionó archivo');
    if (![MediaType.IMAGE, MediaType.VIDEO].includes(tipo)) {
      throw new BadRequestException('Tipo debe ser IMAGE o VIDEO');
    }

    return this.mediaService.uploadMedia(
      file.buffer,
      testimonioId,
      tipo
    );
  }

  @Get('testimonio/:testimonioId')
  @ApiOperation({ summary: 'Listar multimedia de un testimonio' })
  async listTestimonioMedia(
    @Param('testimonioId') testimonioId: string,
    @Query('tipo') tipo?: MediaType
  ) {
    return this.mediaService.listTestimonioMedia(testimonioId, tipo);
  }

  @Delete(':publicId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Eliminar archivo multimedia' })
  async deleteMedia(
    @Param('publicId') publicId: string,
    @Query('tipo') tipo: MediaType
  ) {
    return this.mediaService.deleteMedia(publicId, tipo);
  }

  @Get('urls/:publicId')
  @ApiOperation({ summary: 'Obtener URLs optimizadas' })
  async getMediaUrls(
    @Param('publicId') publicId: string,
    @Query('tipo') tipo: MediaType
  ) {
    return this.mediaService.getMediaUrls(publicId, tipo);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async healthCheck() {
    return this.mediaService.healthCheck();
  }
}