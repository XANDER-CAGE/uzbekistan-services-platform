import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const request = context.switchToHttp().getRequest();
        
        // Если есть загруженный файл, добавляем полный URL
        if (request.file) {
          const baseUrl = `${request.protocol}://${request.get('Host')}`;
          data.fileUrl = `${baseUrl}/uploads/${request.file.filename}`;
        }
        
        return data;
      }),
    );
  }
}