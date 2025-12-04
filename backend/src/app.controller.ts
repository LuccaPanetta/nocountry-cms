import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sistema') 
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Endpoint de bienvenida',
    description: 'Proporciona el mensaje de bienvenida y verifica que el sistema esté funcionando correctamente'
  }) 
  @ApiResponse({ 
    status: 200, 
    description: 'Sistema funcionando correctamente',
    schema: {
      example: '¡Bienvenido al Testimonial CMS - TestiGo! 🚀'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}