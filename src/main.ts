import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import helmet, { crossOriginResourcePolicy } from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /*
   |--------------------------------------------------------------------------
   | Security Headers
   |--------------------------------------------------------------------------
   */
  app.use(helmet({ crossOriginResourcePolicy: false }));

  /*
   |--------------------------------------------------------------------------
   | Cookie Parser
   |--------------------------------------------------------------------------
   */
  app.use(cookieParser());

  /*
   |--------------------------------------------------------------------------
   | CORS
   |--------------------------------------------------------------------------
   */
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:5173',
      'https://bsampah-api.vercel.app',
    ],

    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.use(
    express.json({
      limit: '1mb',
    }),
  );
  /*
   |--------------------------------------------------------------------------
   | Global Validation
   |--------------------------------------------------------------------------
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /*
   |--------------------------------------------------------------------------
   | Global Prefix
   |--------------------------------------------------------------------------
   */
  app.setGlobalPrefix('api');

  /*
   |--------------------------------------------------------------------------
   | Swagger Config
   |--------------------------------------------------------------------------
   */
  const config = new DocumentBuilder()
    .setTitle('Bank Sampah API')
    .setDescription('API Documentation Bank Sampah Digital')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  /*
   |--------------------------------------------------------------------------
   | Swagger Route
   |--------------------------------------------------------------------------
   */
  SwaggerModule.setup('docs', app, document);

  /*
   |--------------------------------------------------------------------------
   | Start Server
   |--------------------------------------------------------------------------
   */
  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}/api`);

  console.log(`📘 Swagger running on http://localhost:${port}/docs`);
  return app;
}

export default bootstrap();
