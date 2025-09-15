import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  HttpInterceptorFn
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';

//
// 🔑 Interceptor gắn token cho API private
//
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // ✅ API public (không cần token)
  const isPublicApi =
    req.url.includes('/api/products') ||
    req.url.includes('/api/categories/featured') || // chỉ featured là public
    req.url.includes('/api/brands') ||
    req.url.includes('/api/attributes') ||
    req.url.includes('/api/reviews/products') ||
    req.url.includes('/uploads');

  if (isPublicApi) {
    return next(req);
  }

  // 👉 Các API private thì gắn token
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

//
// ⚠️ Interceptor xử lý lỗi (401, 403)
//
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Nếu đang ở browser
      if (isPlatformBrowser(platformId)) {
        if (err.status === 401) {
          // ❌ Token hết hạn -> bắt buộc đăng nhập lại
          console.warn('401 Unauthorized, redirect login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (err.status === 403) {
          // ⚠️ 403: chỉ redirect khi không phải API admin
          if (!req.url.includes('/api/admin/')) {
            console.warn('403 Forbidden, redirect login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        // ⚠️ 400, 409: để component xử lý (không redirect)
      }
      return throwError(() => err);
    })
  );
};


//
// ✅ Cấu hình toàn bộ app
//
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), // nếu không muốn zoneless thì bỏ dòng này
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptorFn, errorInterceptorFn]), // interceptor cho mọi request
    ),
  ]
};
