import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const need = route.data?.['permissions'] as string[] | string | undefined;

  if (!need) return true; // route không yêu cầu quyền cụ thể
  const ok = Array.isArray(need) ? auth.hasAll(need) : auth.hasPermission(need);
  if (ok) return true;

  router.navigate(['/home']); // hoặc trang 403
  return false;
};
