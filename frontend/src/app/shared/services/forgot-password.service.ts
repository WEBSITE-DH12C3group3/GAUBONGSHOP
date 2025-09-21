import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  private base = `${environment.apiUrl}/users/forgot-password`;

  constructor(private http: HttpClient) {}

  request(email: string) {
    return this.http.post<{ message?: string; error?: string }>(`${this.base}/request`, { email });
  }

  verify(email: string, code: string) {
    return this.http.post<{ message?: string; error?: string }>(`${this.base}/verify`, { email, code });
  }

  reset(email: string, code: string, newPassword: string) {
    return this.http.post<{ message?: string; error?: string }>(`${this.base}/reset`, { email, code, newPassword });
  }
}
