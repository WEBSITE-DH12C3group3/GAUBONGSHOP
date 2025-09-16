import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CouponAdminService } from '../../shared/services/coupon-admin.service';

@Component({
  standalone: true,
  selector: 'app-coupon-admin-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './coupon-admin-form.html'
})
export class CouponAdminFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(CouponAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = signal<number | null>(null);
  loading = signal(false);
  submitting = signal(false);
  title = signal('Tạo phiếu giảm giá');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    description: [''],
    discountType: ['percent', [Validators.required]],     // percent | fixed
    discountValue: [0, [Validators.required, Validators.min(0)]],
    minOrderAmount: [null as number | null, [Validators.min(0)]],
    maxUses: [null as number | null, [Validators.min(0)]],
    startDate: [null as string | null],
    endDate: [null as string | null],
    active: [true]
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(+idParam);
      this.title.set('Cập nhật phiếu giảm giá');
      this.fetch();
    }
  }

  private fetch() {
    this.loading.set(true);
    this.api.get(this.id()!).subscribe({
      next: c => {
        this.form.patchValue({
          code: c.code,
          description: c.description ?? '',
          discountType: c.discountType,
          discountValue: c.discountValue,
          minOrderAmount: c.minOrderAmount ?? null,
          maxUses: c.maxUses ?? null,
          startDate: c.startDate ? c.startDate.substring(0,16) : null, // ISO -> yyyy-MM-ddTHH:mm
          endDate: c.endDate ? c.endDate.substring(0,16) : null,
          active: c.active
        });
        this.loading.set(false);
      },
      error: err => { alert(err?.error?.error || 'Không tải được dữ liệu'); this.loading.set(false); }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // convert datetime-local to ISO string (backend LocalDateTime)
    const payload = { ...this.form.value };
    const conv = (v: any) => v ? new Date(v).toISOString().slice(0,19) : null;
    (payload as any).startDate = conv(payload.startDate);
    (payload as any).endDate = conv(payload.endDate);

    this.submitting.set(true);
    const obs = this.id()
      ? this.api.update(this.id()!, payload)
      : this.api.create(payload);

    obs.subscribe({
      next: _ => this.router.navigateByUrl('/admin/coupons'),
      error: err => { alert(err?.error?.error || 'Lưu thất bại'); this.submitting.set(false); }
    });
  }
}
