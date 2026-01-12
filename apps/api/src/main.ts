import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const logger = new Logger('Security');

  app.use(
    helmet({
      hidePoweredBy: true,
      xssFilter: true,
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'sameorigin' },
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
      noSniff: true,
      hsts: {
        maxAge: 63072000,
        includeSubDomains: true,
        preload: true,
      },

      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    credentials: true,
    origin: true,
  });

  app.use(compression());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Bilatu')
    .setDescription('API documentation for Bilatu application')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.use(bodyParser.json({ limit: '100mb' })); // Aumenta el límite para JSON
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); // Aumenta para archivos

  await app.listen(+process.env.API_PORT || 3000);
}
bootstrap();
