// auth.interceptor.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // ✅ API public (không cần token)
  const isPublicApi =
    req.url.includes('/api/products') ||
    req.url.includes('/api/categories/featured') || // ✅ chỉ cho featured là public
    req.url.includes('/api/brands') ||
    req.url.includes('/api/attributes') ||
    req.url.includes('/api/reviews/products') ||
    req.url.includes('/uploads');


  if (isPublicApi) {
    return next(req);
  }

  // ✅ Các API private → cần token
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
