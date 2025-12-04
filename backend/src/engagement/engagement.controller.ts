import { Controller, Post, Param, Get, UseGuards } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-role.enum'; 

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post(':id/view')
  registerView(@Param('id') testimonialId: string) {
    return this.engagementService.registerView(testimonialId);
  }

  @Post(':id/embed')
  registerEmbed(@Param('id') testimonialId: string) {
    return this.engagementService.registerEmbed(testimonialId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles(UserRole.ADMIN, UserRole.EDITOR) 
  getMetrics(@Param('id') testimonialId: string) {
    return this.engagementService.getMetricsByTestimonialId(testimonialId);
  }
}