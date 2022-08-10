import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors();

  setupSwagger(app);
  app.setGlobalPrefix('api');
  await app.listen(3080);
}
bootstrap();
