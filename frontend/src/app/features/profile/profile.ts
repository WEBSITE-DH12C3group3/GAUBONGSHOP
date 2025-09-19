import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  // Tab hiện tại
  activeTab: 'profile' | 'security' | 'orders' | 'voucher' | 'history' = 'profile';

  // Chế độ chỉnh sửa hồ sơ
  editMode = false;

  // Hồ sơ người dùng
  profile = {
    username: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
    createdAt: ''
  };

  // Thay đổi mật khẩu
  pwd = {
    current: '',
    next: '',
    confirm: ''
  };

  // Mock dữ liệu đơn hàng, voucher, lịch sử
  orders = [
    { code: 'DH001', date: new Date(), total: 450000, status: 'Đang xử lý' },
    { code: 'DH002', date: new Date(), total: 320000, status: 'Hoàn thành' }
  ];

  vouchers = [
    { code: 'SALE20', desc: 'Giảm 20% cho đơn trên 200k' },
    { code: 'FREESHIP', desc: 'Miễn phí vận chuyển' }
  ];

  history = [
    { date: new Date(), item: 'Gấu Teddy 1m2', amount: 350000 },
    { date: new Date(), item: 'Hoa Bông Hồng', amount: 120000 }
  ];

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadProfile();
    } else {
      this.auth.isLoggedIn$().subscribe(isLogged => {
        if (isLogged) this.loadProfile();
      });
    }
  }

  // Load thông tin hồ sơ từ API
  private loadProfile() {
    this.loading = true;
    this.auth.getCurrentUser().subscribe({
      next: (res: any) => {
        this.profile = {
          username: res?.username || '',
          email: res?.email || '',
          phone: res?.phone || '',
          address: res?.address || '',
          avatarUrl: res?.avatarUrl || '',
          createdAt: res?.createdAt || ''
        };
        this.loading = false;
        this.pwd.current = '********';
        this.cdr.detectChanges(); // ép Angular render ngay
      },
      error: (err) => {
        this.error = 'Không tải được hồ sơ. Vui lòng đăng nhập lại hoặc thử lại sau.';
        this.loading = false;
        console.error('Profile load error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // Chuyển tab
  setTab(tab: 'profile' | 'security' | 'orders' | 'voucher' | 'history') {
    this.activeTab = tab;
  }

  // Toggle edit mode
  toggleEdit() {
    this.editMode = !this.editMode;
  }

  // Lưu hồ sơ
  onSaveProfile(form: NgForm) {
    if (form.invalid) {
      alert('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    this.auth.updateProfile(this.profile).subscribe({
      next: (res: any) => {
        this.profile = { ...res }; // nhận UserDTO trả về
        this.editMode = false;
        alert('✅ Hồ sơ đã được cập nhật!');
      },
      error: (err) => {
        console.error('❌ Update profile error:', err);
        alert('Có lỗi xảy ra khi cập nhật hồ sơ.');
      }
    });
  }

  // Đổi mật khẩu
  onChangePassword() {
    if (!this.pwd.current || !this.pwd.next || !this.pwd.confirm) {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (this.pwd.next !== this.pwd.confirm) {
      alert('Mật khẩu mới nhập lại không khớp.');
      return;
    }

    this.auth.changePassword({
      currentPassword: this.pwd.current,
      newPassword: this.pwd.next
    }).subscribe({
      next: (res: any) => {
        alert('✅ ' + (res.message || 'Đổi mật khẩu thành công'));
        this.pwd = { current: '********', next: '', confirm: '' }; // reset
      },
      error: (err) => {
        alert('❌ ' + (err.error?.error || 'Lỗi khi đổi mật khẩu'));
      }
    });
  }

  // Xem chi tiết đơn hàng
  viewOrder(order: any) {
    alert('(Demo) Xem chi tiết đơn ' + order.code);
  }

  // Áp dụng voucher
  applyVoucher(voucher: any) {
    alert('(Demo) Đã áp dụng voucher: ' + voucher.code);
  }
}
