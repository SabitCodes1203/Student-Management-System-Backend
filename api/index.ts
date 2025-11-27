import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/src/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '../dist/src/common/filters/http-exception.filter';
import type { Request, Response } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: express.Application;

async function createApp(): Promise<express.Application> {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    console.log('Initializing NestJS app...');
    console.log('Environment variables check:', {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV,
    });

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
    console.log('NestJS app initialized successfully');
    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    console.error('Error creating NestJS app:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export default async function handler(
  req: Request,
  res: Response,
) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
