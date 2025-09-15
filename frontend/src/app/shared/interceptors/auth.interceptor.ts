import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Chỉ chạy khi ở browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      console.log("🔑 Token trong interceptor:", token);

      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("📤 Request kèm Authorization:", authReq);
        return next.handle(authReq);
      }
    }

    return next.handle(req);
  }
}
