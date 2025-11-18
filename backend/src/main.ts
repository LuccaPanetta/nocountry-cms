import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
;
import * as dotenv from 'dotenv';
import { GlobalValidationPipe } from './infra/validators/pipes/global-validation.pipe';
import { HttpExceptionFilter } from './infra/validators/http-exception.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
