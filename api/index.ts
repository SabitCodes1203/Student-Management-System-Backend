import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import type { Request, Response } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: express.Application;

async function createApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(
  req: Request,
  res: Response,
) {
  const app = await createApp();
  return app(req, res);
}

