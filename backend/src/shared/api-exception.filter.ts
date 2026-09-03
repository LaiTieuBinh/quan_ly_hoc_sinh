import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

interface ErrorDetail { code?: string; message?: string | string[]; fields?: Record<string, string>; retryAfter?: number }

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined;
    const detail: ErrorDetail = typeof raw === 'object' && raw !== null ? raw as ErrorDetail : { message: typeof raw === 'string' ? raw : undefined };
    if (detail.retryAfter) response.setHeader('Retry-After', detail.retryAfter);
    const validationMessages = status === 400 && Array.isArray(detail.message) ? detail.message : undefined;
    response.status(status).json({ error: {
      code: detail.code ?? (validationMessages ? 'VALIDATION_ERROR' : status === 500 ? 'AUTH_SERVICE_ERROR' : `HTTP_${status}`),
      message: validationMessages ? 'Dữ liệu đầu vào không hợp lệ.' : detail.message ?? 'Có lỗi xảy ra. Vui lòng thử lại sau.',
      fields: detail.fields ?? (validationMessages ? { request: validationMessages.join(' ') } : {}),
    } });
  }
}
