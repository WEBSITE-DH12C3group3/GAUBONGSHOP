import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  // env.apiUrl đã có '/api' => không lặp /api nữa
  private base = `${environment.apiUrl}/admin`;

  // ----------------------------
  // Admin APIs
  // ----------------------------
  searchUsers(q = '', roleId?: number, excludeRoles: string[] = [], page = 0, size = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q?.trim()) params = params.set('q', q.trim());
    if (roleId) params = params.set('roleId', roleId);
    if (excludeRoles?.length) params = params.set('excludeRoles', excludeRoles.join(','));

    return this.http.get<{ content: any[]; totalElements: number }>(
      `${this.base}/users`,
      { params }
    );
  }

  createUser(payload: { username?: string; phone?: string; email: string; password: string; roleIds?: number[]; }) {
    return this.http.post<User>(`${this.base}/users`, payload);
  }

  // ----------------------------
  // ⭐ Thêm API lấy hồ sơ đang đăng nhập
  // ----------------------------
  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/users/me/profile`);
  }
}
