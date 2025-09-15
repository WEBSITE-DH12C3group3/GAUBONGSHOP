import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // ✅ Các API public (không cần token)
    const isPublic =
      req.url.includes('/api/products') ||
      req.url.includes('/api/categories') ||
      req.url.includes('/api/brands') ||
      req.url.includes('/api/attributes') ||
      req.url.includes('/api/reviews/products') ||
      req.url.includes('/uploads');

    if (token && !isPublic) {
      // Chỉ gắn token khi là API private
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // Nếu không có token hoặc API public thì đi thẳng
    return next.handle(req);
  }
}
