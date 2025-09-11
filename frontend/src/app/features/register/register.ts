import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIf],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  loading = false;
  error: string | null = null;

  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    console.log('[Register] submit fired. form.valid =', form.valid, 'payload=', this.user);
    this.error = null;

    if (!form.valid) {
      this.error = 'Vui lòng nhập đầy đủ thông tin hợp lệ.';
      return;
    }
    if (this.user.password !== this.user.confirmPassword) {
      this.error = 'Mật khẩu nhập lại không khớp!';
      return;
    }

    this.loading = true;
    this.auth.register({
      username: this.user.username,
      email: this.user.email,
      password: this.user.password,
      phone: this.user.phone,
      address: this.user.address
    }).subscribe({
      next: (res: any) => {
        console.log('[Register] success:', res);
        if (res?.token) this.auth.saveToken(res.token);
        alert('Đăng ký thành công!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('[Register] error:', err);
        this.error = err?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      },
      complete: () => this.loading = false
    });
  }
}
