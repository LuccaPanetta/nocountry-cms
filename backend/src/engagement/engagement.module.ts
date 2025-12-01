import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';
import { EngagementMetric } from './entities/engagement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EngagementMetric]),
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}
