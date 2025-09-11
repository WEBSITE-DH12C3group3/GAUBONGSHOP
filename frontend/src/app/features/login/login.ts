import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: (err) => {
            console.error('Login error:', err);
            alert(`Đăng nhập thất bại: ${err.status === 401 ? 'Sai email hoặc mật khẩu!' : 'Lỗi server: ' + err.status}`);
          }
    });
  }
}
