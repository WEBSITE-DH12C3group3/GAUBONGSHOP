import { Component, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForgotPasswordService } from '../../shared/services/forgot-password.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent implements OnDestroy {
  // ==== UI State ====
  step = signal<1 | 2 | 3>(1); // 1: email, 2: otp, 3: reset
  loading = signal(false);
  notice = signal<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Countdown 5 phút cho OTP
  secondsLeft = signal(0);
  private timer?: any;

  // ==== Forms ====
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private forgot: ForgotPasswordService,
    private router: Router // <-- thêm Router để điều hướng
  ) {
    // Khởi tạo forms
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      d0: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      d1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      d2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      d3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      d4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      d5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    });

    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );

    // Tự ẩn thông báo sau 5s
    effect(() => {
      const n = this.notice();
      if (n) setTimeout(() => this.notice.set(null), 5000);
    });
  }

  // ==== Helpers ====
  private get email(): string {
    return (this.emailForm.value['email'] || '').trim();
  }

  private get code(): string {
    const v = this.otpForm.value as Record<string, string>;
    return `${v['d0'] || ''}${v['d1'] || ''}${v['d2'] || ''}${v['d3'] || ''}${v['d4'] || ''}${v['d5'] || ''}`;
  }

  private startCountdown(seconds = 300) {
    this.clearTimer();
    this.secondsLeft.set(seconds);
    this.timer = setInterval(() => {
      const cur = this.secondsLeft();
      if (cur <= 1) {
        this.clearTimer();
        this.secondsLeft.set(0);
      } else {
        this.secondsLeft.set(cur - 1);
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  secondsToMMSS() {
    const s = this.secondsLeft();
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  passwordsMatch(group: FormGroup) {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmPassword')?.value;
    return a && b && a === b ? null : { notMatch: true };
  }

  // ==== Actions ====
  submitEmail() {
    if (this.emailForm.invalid) return;
    this.loading.set(true);
    this.notice.set(null);

    this.forgot.request(this.email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notice.set({
          type: 'success',
          text: res?.message || 'Đã gửi mã xác thực tới email (hết hạn sau 5 phút).',
        });
        this.step.set(2);
        this.startCountdown(300);
        this.otpForm.reset();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.error || 'Không thể gửi mã. Vui lòng thử lại.';
        this.notice.set({ type: 'error', text: msg });
      },
    });
  }

  resendCode() {
    if (!this.email) return;
    this.loading.set(true);
    this.notice.set(null);

    this.forgot.request(this.email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notice.set({ type: 'success', text: res?.message || 'Đã gửi lại mã.' });
        this.startCountdown(300);
        this.otpForm.reset();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.error || 'Không thể gửi lại mã.';
        this.notice.set({ type: 'error', text: msg });
      },
    });
  }

  verifyCode() {
    if (this.otpForm.invalid) return;
    if (this.secondsLeft() <= 0) {
      this.notice.set({ type: 'error', text: 'Mã đã hết hạn. Vui lòng bấm Gửi lại mã.' });
      return;
    }

    this.loading.set(true);
    this.notice.set(null);

    this.forgot.verify(this.email, this.code).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notice.set({ type: 'success', text: res?.message || 'Mã hợp lệ. Vui lòng đặt mật khẩu mới.' });
        this.step.set(3);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.error || 'Mã không đúng.';
        this.notice.set({ type: 'error', text: msg });
      },
    });
  }

  submitReset() {
    if (this.resetForm.invalid) return;
    this.loading.set(true);
    this.notice.set(null);

    const newPassword = this.resetForm.value['newPassword'] as string;

    this.forgot.reset(this.email, this.code, newPassword).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notice.set({
          type: 'success',
          text: res?.message || 'Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...',
        });

        // Khoá form & dừng đếm ngược (cho gọn gàng)
        this.resetForm.disable();
        this.clearTimer();

        // Điều hướng về /login (ngay lập tức hoặc sau 1–2 giây cho dễ đọc thông báo)
        // this.router.navigate(['/login']);
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.error || 'Không thể đổi mật khẩu.';
        this.notice.set({ type: 'error', text: msg });
      },
    });
  }

  // ==== OTP input auto-advance/backspace ====
  onDigitInput(e: Event, idx: number) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    if (input.value && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null;
      next?.focus();
      next?.select();
    }
  }

  onDigitKeydown(e: KeyboardEvent, idx: number) {
    const input = e.target as HTMLInputElement;
    if (e.key === 'Backspace' && !input.value && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement | null;
      prev?.focus();
      prev?.select();
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement | null;
      prev?.focus();
      prev?.select();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null;
      next?.focus();
      next?.select();
      e.preventDefault();
    }
  }

  // ==== Password strength (đơn giản) ====
  strength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4); // 0..4
  }
}
