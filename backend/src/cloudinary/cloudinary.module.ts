import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryMediaService } from './cloudinary-media.service';
@Module({
  imports: [ConfigModule],
  providers: [CloudinaryMediaService],
  exports: [CloudinaryMediaService],
})
export class CloudinaryModule {}