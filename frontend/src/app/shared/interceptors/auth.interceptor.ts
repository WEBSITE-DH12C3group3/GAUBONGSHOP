// src/app/shared/interceptors/auth.interceptor.ts
import { inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // 1) Bỏ qua preflight
  const method = (req.method ?? 'GET').toUpperCase();
  if (method === 'OPTIONS') return next(req);

  // 2) Nhận diện request có phải API của mình
  const apiBase = (environment.apiUrl ?? '').replace(/\/+$/, ''); // trim trailing slash
  const url = req.url ?? '';

  // Absolute API: http(s)://host:port/... khớp apiBase
  const isAbsoluteApi = !!apiBase && (url === apiBase || url.startsWith(apiBase + '/'));
  // Relative API: /api/...
  const isRelativeApi = url.startsWith('/api/');
  const isApi = isAbsoluteApi || isRelativeApi;

  if (!isApi) {
    // Không phải call API nội bộ → chuyển tiếp luôn
    return next(req);
  }

  // 3) Suy ra "path" tương đối để áp rule
  const path = isAbsoluteApi ? url.slice(apiBase.length) : url; // ví dụ: /api/xxx

  const is = (m: string) => method === m;

  // 4) Allow-list: endpoint PUBLIC
  //    - Các endpoint auth/guest
  //    - Các GET public (catalog/media)
  const isExplicitPublic =
    (is('POST') && (
      path.startsWith('/api/users/login') ||
      path.startsWith('/api/users/register') ||
      path.startsWith('/api/auth/guest')
    )) ||
    (is('GET') && (
      path.startsWith('/uploads/') ||
      path.startsWith('/brandimg/')
    ));

  const isPublicGet =
    is('GET') && (
      path.startsWith('/api/products')   ||
      path.startsWith('/api/categories') ||
      path.startsWith('/api/brands')     ||
      path.startsWith('/api/attributes') ||
      path.startsWith('/api/reviews/products')
    );

  if (isExplicitPublic || isPublicGet) {
    const publicReq = req.clone({
      setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    return next(publicReq).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  // 5) PRIVATE: gắn token (chỉ đọc storage khi chạy browser)
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

  // Nếu header Authorization đã có sẵn thì không ghi đè
  const alreadyHasAuth = req.headers.has('Authorization');

  let authHeader: string | undefined;
  if (!alreadyHasAuth && token) {
    authHeader = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
  }

  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(authHeader ? { Authorization: authHeader } : {})
  };

  // Lưu ý: KHÔNG tự set Content-Type để tránh phá multipart/FormData
  const authReq = req.clone({
    setHeaders: headers
    // Nếu backend dùng cookie session:
    // withCredentials: (environment as any).authWithCredentials === true
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // 6) Xử lý 401: xoá token + chuyển về login (trừ khi chính endpoint login/register lỗi)
      if (err.status === 401) {
        const isAuthPath =
          path.startsWith('/api/users/login') ||
          path.startsWith('/api/users/register');

        // Dọn state auth local
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('jwt');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('access_token');
        } catch {}

        if (!isAuthPath && isPlatformBrowser(platformId)) {
          const returnUrl = location.pathname + location.search;
          router.navigate(['/login'], { queryParams: { returnUrl } });
        }
      }
      return throwError(() => err);
    })
  );
};
