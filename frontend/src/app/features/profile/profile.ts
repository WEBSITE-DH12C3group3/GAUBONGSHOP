import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  loading = true;
  error: string | null = null;

  // Hồ sơ hiển thị và chỉnh sửa
  profile = {
    username: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: ''
  };

  // Đổi mật khẩu
  pwd = {
    current: '',
    next: '',
    confirm: ''
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // Lấy user hiện tại
    this.auth.getCurrentUser().subscribe({
      next: (res: any) => {
        // Map dữ liệu tùy API của bạn
        this.profile.username = res?.username || '';
        this.profile.email    = res?.email || '';
        this.profile.phone    = res?.phone || '';
        this.profile.address  = res?.address || '';
        this.profile.avatarUrl = res?.avatarUrl || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không tải được hồ sơ. Vui lòng đăng nhập lại hoặc thử lại sau.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSaveProfile(form: NgForm) {
    if (form.invalid) return;
    // TODO: Gọi API cập nhật hồ sơ, ví dụ:
    // this.auth.updateProfile(this.profile).subscribe(...)
    alert('(Demo) Đã lưu hồ sơ!');
  }

  onChangePassword() {
    if (!this.pwd.current || !this.pwd.next || !this.pwd.confirm) {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (this.pwd.next !== this.pwd.confirm) {
      alert('Mật khẩu mới nhập lại không khớp.');
      return;
    }
    // TODO: Gọi API đổi mật khẩu, ví dụ:
    // this.auth.changePassword(this.pwd).subscribe(...)
    alert('(Demo) Đã đổi mật khẩu!');
    this.pwd = { current: '', next: '', confirm: '' };
  }
}
