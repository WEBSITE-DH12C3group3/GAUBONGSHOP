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

    // Nếu đang chạy trên browser và có token thì coi như đã login
    if (this.isBrowser && this.getToken()) {
      this.loggedIn$.next(true);
    }
  }

  // ----------------------------
  // Đăng ký
  // ----------------------------
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ----------------------------
  // Đăng nhập
  // ----------------------------
login(data: any): Observable<any> {
  return new Observable((observer) => {
    this.http.post<any>(`${this.apiUrl}/login`, data).subscribe({
      next: (res) => {
        if (res.token) {
          this.saveToken(res.token);
        }
        if (res.user) {
          this.saveUser(res.user);
        }

        // ✅ đảm bảo BehaviorSubject update ngay
        this.loggedIn$.next(true);

        observer.next(res);
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  });
}


  // ----------------------------
  // Lấy user hiện tại (dựa vào token)
  // ----------------------------
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    });
  }

  // ----------------------------
  // Quản lý User / Token trong LocalStorage
  // ----------------------------
  saveUser(user: any) {
    if (this.isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): any {
    if (this.isBrowser) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Cập nhật hồ sơ người dùng
  updateProfile(profile: any): Observable<any> {
    const token = this.getToken();
    console.log('DEBUG: token gửi đi', token);
    console.log('DEBUG: profile gửi đi', profile);

    return this.http.put(`${this.apiUrl}/update`, profile, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/change-password`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }




  saveToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      this.loggedIn$.next(true);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // ----------------------------
  // Role helper
  // ----------------------------
  getRole(): string | null {
    const user = this.getUser();
    return user?.roles?.length > 0 ? user.roles[0].name : null;
  }

  // ----------------------------
  // Trạng thái đăng nhập
  // ----------------------------
  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  // ----------------------------
  // Đăng xuất
  // ----------------------------
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.loggedIn$.next(false);
    }
  }
}
