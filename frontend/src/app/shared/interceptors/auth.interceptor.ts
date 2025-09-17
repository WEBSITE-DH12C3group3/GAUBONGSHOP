// auth.interceptor.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Bỏ qua preflight
  if ((req.method || '').toUpperCase() === 'OPTIONS') {
    return next(req);
  }

  // Xác định có phải call API không (hỗ trợ cả absolute & relative)
  const apiBase = environment.apiUrl.replace(/\/+$/, '');               // trim trailing slash
  const isAbsoluteApi = req.url.startsWith(apiBase + '/');
  const isRelativeApi = req.url.startsWith('/api/');
  const isApiCall = isAbsoluteApi || isRelativeApi;
  if (!isApiCall) return next(req);

  // Lấy path tương đối để so khớp rule
  const path = isAbsoluteApi ? req.url.substring(apiBase.length) : req.url; // vd: /api/...
  const method = (req.method || 'GET').toUpperCase();

  // --- PUBLIC EXPLICIT (không gắn token) ---
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

  // --- PUBLIC GET (catalog) ---
  const isPublicGet =
    method === 'GET' && (
      path.startsWith('/api/products')   ||
      path.startsWith('/api/categories') ||
      path.startsWith('/api/brands')     ||
      path.startsWith('/api/attributes') ||
      path.startsWith('/api/reviews/products')
    );

  if (isExplicitPublic || isPublicGet) {
    return next(req);
  }

  // --- PRIVATE: gắn token ---
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

  const authReq = token ? req.clone({ setHeaders: { Authorization: token } }) : req;
  return next(authReq);
};
