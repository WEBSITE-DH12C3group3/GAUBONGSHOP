import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/admin`;

  // Đổi endpoint nếu bạn đã có API search riêng
  searchUsers(q: string, page = 0, size = 10) {
    return this.http.get<{ content: User[] }>(`${this.base}/users`, { params: { q, page, size } });
  }
}
