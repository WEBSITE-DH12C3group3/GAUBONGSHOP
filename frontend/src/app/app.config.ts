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

// ---------- Auth Interceptor ----------
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Bỏ qua preflight
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') return next(req);

  // Nhận diện API absolute/relative
  const apiBase = (environment.apiUrl || '').replace(/\/+$/, ''); // trim trailing slash
  const url = req.url || '';

  const isAbsoluteApi = apiBase && url.startsWith(apiBase + '/');
  const isRelativeApi = url.startsWith('/api/');
  if (!isAbsoluteApi && !isRelativeApi) return next(req);

  // Lấy path tương đối để soi rule
  const path = isAbsoluteApi ? url.substring(apiBase.length) : url; // vd: /api/...

  // PUBLIC cụ thể (login/register/guest, file tĩnh…)
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

  // PUBLIC GET (catalog)
  const isPublicGet =
    method === 'GET' && (
      path.startsWith('/api/products')   ||
      path.startsWith('/api/categories') ||
      path.startsWith('/api/brands')     ||
      path.startsWith('/api/attributes') ||
      path.startsWith('/api/reviews/products')
    );

  if (isExplicitPublic || isPublicGet) {
    // thêm header nhẹ để backend phân biệt XHR (tuỳ bạn)
    return next(req.clone({ setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }}));
  }

  // PRIVATE: gắn token (chỉ trên browser)
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('jwt') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      null;
  }
  if (token && !/^Bearer\s/i.test(token)) token = `Bearer ${token}`;

  const headers: Record<string,string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: token } : {})
  };

  // Nếu backend dùng cookie/session: bật withCredentials
  // const useCookie = !!(environment as any).authWithCredentials;

  return next(req.clone({
    setHeaders: headers,
    // withCredentials: useCookie === true
  }));
};

// ---------- Error Interceptor ----------
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isPlatformBrowser(platformId)) {
        if (err.status === 401) {
          // Token hết hạn / chưa đăng nhập
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Điều hướng SPA (mượt hơn window.location.href)
          router.navigateByUrl('/login');
        } else if (err.status === 403) {
          // Chỉ redirect khi đụng API admin
          if (req.url.includes('/api/admin/')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.navigateByUrl('/login');
          } else {
            // Public 403: để component tự xử lý
            console.warn('[403] Forbidden on public API:', req.url);
          }
        }
        // Các lỗi khác (400, 409, 500...) để component tự xử lý UI/Toast
      }
      return throwError(() => err);
    })
  );
};

// ---------- App Config ----------
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptorFn, errorInterceptorFn])
    ),
  ]
};
