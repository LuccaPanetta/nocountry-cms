import { Controller, Post, Param } from '@nestjs/common';
import { EngagementService } from './engagement.service';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}
  
  @Post(':id/view')
  registerView(@Param('id') testimonialId: string) {
    return this.engagementService.registerView(testimonialId);
  }
}