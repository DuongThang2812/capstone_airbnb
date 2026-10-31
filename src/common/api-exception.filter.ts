import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { success } from './api-response';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const detail = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof detail === 'string'
      ? detail
      : typeof detail === 'object' && detail !== null && 'message' in detail
        ? String(detail.message)
        : 'Lỗi máy chủ';

    response.status(statusCode).json(success(null, message, statusCode));
  }
}
