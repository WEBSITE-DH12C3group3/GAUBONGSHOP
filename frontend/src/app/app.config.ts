// src/app/app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
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
import { Router } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

/** ===================== AUTH INTERCEPTOR ===================== **/
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // 1) Bỏ qua preflight/đầu dò
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS' || method === 'HEAD') {
    return next(req);
  }

  // 2) Nhận diện API absolute/relative
  const apiBase = (environment.apiUrl || '').replace(/\/+$/, ''); // trim trailing slash
  const url = req.url || '';

  // URL tuyệt đối là API nếu bằng hẳn apiBase hoặc bắt đầu bằng apiBase + '/'
  const isAbsoluteApi = !!apiBase && (url === apiBase || url.startsWith(apiBase + '/'));
  // URL tương đối là API nếu bắt đầu bằng /api hoặc đúng '/api'
  const isRelativeApi = url === '/api' || url.startsWith('/api/');
  if (!isAbsoluteApi && !isRelativeApi) {
    return next(req);
  }

  // 3) Path tương đối để áp rule
  const path = isAbsoluteApi ? url.substring(apiBase.length) : url; // ví dụ: /api/xxx

  // 4) Allow-list endpoint PUBLIC
  const isExplicitPublic =
    (method === 'POST' && (
      path.startsWith('/api/users/login') ||
      path.startsWith('/api/users/register') ||
      path.startsWith('/api/auth/guest')
    )) ||
    (method === 'GET' && (
      path.startsWith('/uploads/') ||
      path.startsWith('/brandimg/')
    ));

  const isPublicGet =
    method === 'GET' && (
      path.startsWith('/api/products')   ||
      path.startsWith('/api/categories') ||
      path.startsWith('/api/brands')     ||
      path.startsWith('/api/attributes') ||
      path.startsWith('/api/reviews/products')
    );

  if (isExplicitPublic || isPublicGet) {
    return next(req.clone({
      setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }
    }));
  }

  // 5) PRIVATE: gắn token (chỉ khi chạy trên browser)
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    try {
      token =
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('jwt') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('access_token') ||
        null;
    } catch {
      token = null;
    }
  }
  if (token && !/^Bearer\s/i.test(token)) token = `Bearer ${token}`;

  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: token } : {})
  };

  // Lưu ý: KHÔNG set Content-Type để không phá multipart/FormData
  const authReq = req.clone({
    setHeaders: headers
    // Nếu backend dùng cookie session:
    // withCredentials: (environment as any).authWithCredentials === true
  });

  return next(authReq);
};

/** ===================== ERROR INTERCEPTOR ===================== **/
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // Tự nhận diện đây có phải là endpoint auth không (để tránh loop)
  const apiBase = (environment.apiUrl || '').replace(/\/+$/, '');
  const url = req.url || '';
  const isAbsoluteApi = !!apiBase && (url === apiBase || url.startsWith(apiBase + '/'));
  const isRelativeApi = url === '/api' || url.startsWith('/api/');
  const path = isAbsoluteApi ? url.substring(apiBase.length) : (isRelativeApi ? url : '');
  const isAuthPath =
    path.startsWith('/api/users/login') ||
    path.startsWith('/api/users/register');

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isPlatformBrowser(platformId)) {
        if (err.status === 401) {
          // Token hết hạn / chưa đăng nhập
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('access_token');
          } catch {}

          if (!isAuthPath) {
            const returnUrl = location.pathname + location.search;
            router.navigate(['/login'], { queryParams: { returnUrl } });
          }
        } else if (err.status === 403) {
          // Với API admin thì đẩy về login; còn public 403 để UI tự xử
          const hitAdminApi = path.startsWith('/api/admin/');
          if (hitAdminApi && !isAuthPath) {
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('access_token');
              localStorage.removeItem('jwt');
              localStorage.removeItem('user');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('access_token');
            } catch {}
            const returnUrl = location.pathname + location.search;
            router.navigate(['/login'], { queryParams: { returnUrl } });
          } else {
            console.warn('[403] Forbidden:', req.url);
          }
        }
        // Các lỗi khác: để component/service hiển thị message phù hợp
      }
      return throwError(() => err);
    })
  );
};

export const debugLogInterceptorFn: HttpInterceptorFn = (req, next) => {
  // Log sau khi authInterceptor đã chạy: gói next() bằng tap
  return next(req).pipe();
};

/** ===================== APP CONFIG ===================== **/
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), // Bạn đang chủ động markForCheck() sau socket events → OK
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptorFn,         // gắn Authorization
        (req, next) => {
          // in ra lần nữa, ở đây log thẳng request đã được clone
          const hasAuth = req.headers.has('Authorization');
          const auth = req.headers.get('Authorization');
          if (req.url.includes('/api/client/chat/sessions/with-admin')) {
            console.info('[DEBUG] outgoing', req.method, req.url, {
              hasAuth,
              // In độ dài cho an toàn (tránh lộ token full)
              authLen: auth?.length ?? 0,
              authPrefix: auth?.slice(0, 14) // "Bearer xxxx..."
            });
          }
          return next(req);
        },
        errorInterceptorFn
      ])
    ),
  ]
};
