// src/app/shared/interceptors/auth.interceptor.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // 1) Bỏ qua preflight
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') return next(req);

  // 2) Nhận diện request có phải gọi API của mình hay không
  const apiBase = (environment.apiUrl || '').replace(/\/+$/, ''); // trim trailing slash
  const url = req.url || '';

  // Absolute API: http(s)://host:port/... khớp apiBase
  const isAbsoluteApi = apiBase && url.startsWith(apiBase + '/');

  // Relative API: /api/...
  const isRelativeApi = url.startsWith('/api/');

  // Nếu không phải call API -> bỏ qua
  if (!isAbsoluteApi && !isRelativeApi) return next(req);

  // 3) Suy ra "path" tương đối để soi rule
  const path = isAbsoluteApi ? url.substring(apiBase.length) : url; // ví dụ: /api/xxx

  // 4) Allow-list: các endpoint PUBLIC
  //    - Các endpoint auth/guest
  //    - Các GET public (catalog)
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
    // Có thể thêm X-Requested-With để backend phân biệt XHR
    const publicReq = req.clone({
      setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    return next(publicReq);
  }

  // 5) PRIVATE: gắn token (chỉ đọc storage khi chạy browser)
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

  if (token && !/^Bearer\s/i.test(token)) {
    token = `Bearer ${token}`;
  }

  // (Tuỳ chọn) Nếu backend dùng cookie session thay vì Bearer:
  // const useCookie = !!(environment as any).authWithCredentials;

  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: token } : {})
  };

  const authReq = req.clone({
    setHeaders: headers,
    // withCredentials: useCookie === true
  });

  return next(authReq);
};
