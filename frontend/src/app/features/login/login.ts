import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Vui lòng nhập đầy đủ email và mật khẩu';
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        if (res.token) this.auth.saveToken(res.token);
        if (res.user) this.auth.saveUser(res.user);
        if (Array.isArray(res.permissions)) this.auth.savePermissions(res.permissions);

        // ✅ Lấy role name đầu tiên
        const role = this.auth.getRole();

        // ✅ Điều hướng
        setTimeout(() => {
          if (role && role.toUpperCase() === 'CUSTOMER') {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
        }, 0);

        this.loading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error =
          err?.status === 401
            ? 'Sai email hoặc mật khẩu!'
            : 'Lỗi máy chủ, vui lòng thử lại.';
        this.loading = false;
      }
    });
  }
}
