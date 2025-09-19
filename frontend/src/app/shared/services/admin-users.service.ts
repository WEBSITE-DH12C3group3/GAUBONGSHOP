import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RoleDto {
  id: number;
  code?: string;      // nếu backend có cột code kỹ thuật
  name: string;       // tên hiển thị (ADMIN / MANAGER / ...)
  description?: string;
  createdAt?: string;
  permissions?: { id: number; name: string; description?: string }[];
}

export interface PermissionDto {
  id: number;
  name: string;           // ví dụ: manage_products
  description?: string;   // mô tả TV
}

export interface AdminUserDto {
  id: number;
  email: string;
  username?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  roles?: { id: number; name: string; code?: string }[];
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly rolesUrl = `${environment.apiUrl}/admin/roles`;
  private readonly permsUrl = `${environment.apiUrl}/admin/permissions`;
  private readonly usersUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // ---- Roles
  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.rolesUrl, { headers: this.headers() });
  }

createRole(data: { code?: string; name: string; description?: string; permissions: string[] }): Observable<RoleDto> {
  return this.http.post<RoleDto>(this.rolesUrl, data, { headers: this.headers() });
}

updateRole(id: number, data: { code?: string; name: string; description?: string; permissions: string[] }): Observable<RoleDto> {
  return this.http.put<RoleDto>(`${this.rolesUrl}/${id}`, data, { headers: this.headers() });
}


  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${id}`, { headers: this.headers() });
  }

  // ---- Permissions
  getPermissions(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(this.permsUrl, { headers: this.headers() });
  }

  // ---- Users
  getUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(this.usersUrl, { headers: this.headers() });
  }

  createUser(payload: {
    email: string;
    password: string;
    username?: string;
    phone?: string;
    address?: string;
  }): Observable<AdminUserDto> {
    return this.http.post<AdminUserDto>(this.usersUrl, payload, { headers: this.headers() });
  }

  // gán role cho user (backend của bạn đã có "doAssign" xoá cũ -> gán mới)
  assignRole(userId: number, roleId: number): Observable<void> {
    // tuỳ backend: body hoặc query; mình để body cho an toàn
    return this.http.post<void>(`${this.usersUrl}/${userId}/assign-role`, { roleId }, { headers: this.headers() });
  }

  // tiện ích: tạo user mới rồi gán role ngay
  createUserAndAssignRole(
    userPayload: { email: string; password: string; username?: string; phone?: string; address?: string },
    roleId: number
  ): Observable<AdminUserDto> {
    return this.createUser(userPayload).pipe(
      switchMap(u => this.assignRole(u.id, roleId).pipe(map(() => u)))
    );
  }
}
