import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const detail = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof detail === 'object' && detail && 'message' in detail ? (detail as { message: string | string[] }).message : 'Có lỗi xảy ra.';
    response.status(status).json({ error: { code: status === 500 ? 'INTERNAL_ERROR' : `HTTP_${status}`, message, fields: {} } });
  }
}

