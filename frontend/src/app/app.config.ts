import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { routes } from './app.routes';

// 🔑 Interceptor gắn token
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};

// ⚠️ Interceptor xử lý lỗi (401, 403)
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        console.warn('Token hết hạn hoặc không hợp lệ, redirect về login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // 👈 tự động về trang login
      }
      return throwError(() => err);
    })
  );
};

// ✅ Cấu hình toàn bộ app
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), // nếu không muốn zoneless thì bỏ dòng này
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptorFn, errorInterceptorFn]) // interceptor cho mọi request
    )
  ]
};
