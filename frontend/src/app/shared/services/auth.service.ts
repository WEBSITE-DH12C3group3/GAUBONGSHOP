import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/users';
  private isBrowser: boolean;
  private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Khi chạy ở browser thì kiểm tra token sẵn có
    if (this.isBrowser && this.getToken()) {
      this.loggedIn$.next(true);
    }
  }

  // Đăng ký
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Đăng nhập
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // Lấy user hiện tại
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    });
  }

  getRole(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.roles && user.roles.length > 0 ? user.roles[0].name : null;
  }

saveUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}


  // Lưu token
  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      this.loggedIn$.next(true);
    }
  }

  // Lấy token
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Kiểm tra đăng nhập
  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  // Observable để subscribe trong component
  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  // Đăng xuất
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      this.loggedIn$.next(false);
    }
  }
}
