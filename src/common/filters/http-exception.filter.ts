import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp
      ? (exception.getResponse() as any)
      : 'Internal server error';

    // Log the error for debugging
    if (!isHttp) {
      this.logger.error('Internal server error:', exception);
      if (exception instanceof Error) {
        this.logger.error('Error stack:', exception.stack);
      }
    }

    response.status(status).json({
      statusCode: status,
      error:
        typeof message === 'object' && message?.message
          ? message.message
          : typeof message === 'string'
            ? message
            : 'Error',
      timestamp: new Date().toISOString(),
    });
  }
}
