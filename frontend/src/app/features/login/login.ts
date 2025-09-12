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

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Vui lòng nhập đầy đủ email và mật khẩu';
      return;
    }

    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.token);
        this.auth.saveUser(res.user);

        const role = this.auth.getRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err?.status === 401 ? 'Sai email hoặc mật khẩu!' : 'Lỗi server';
        this.loading = false;
      }
    });
  }
}
