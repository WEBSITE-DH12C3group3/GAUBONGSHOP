import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ShipVoucherAdminService } from '../../shared/services/ship-voucher-admin.service';

@Component({
  standalone: true,
  selector: 'app-ship-voucher-admin-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ship-voucher-admin-form.html'
})
export class ShipVoucherAdminFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ShipVoucherAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = signal<number | null>(null);
  loading = signal(false);
  submitting = signal(false);
  title = signal('Tạo phiếu vận chuyển');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    description: [''],

    discountType: ['free', [Validators.required]], // free | percent | fixed
    discountValue: [0, [Validators.required, Validators.min(0)]],
    maxDiscountAmount: [null as number | null, [Validators.min(0)]],

    minOrderAmount: [null as number | null, [Validators.min(0)]],
    minShippingFee: [null as number | null, [Validators.min(0)]],

    applicableCarriers: [''],
    regionInclude: [''],
    regionExclude: [''],

    maxUses: [null as number | null, [Validators.min(0)]],
    maxUsesPerUser: [null as number | null, [Validators.min(0)]],

    startDate: [null as string | null],
    endDate: [null as string | null],
    active: [true]
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id.set(+idParam);
      this.title.set('Cập nhật phiếu vận chuyển');
      this.fetch();
    }
  }

  private fetch() {
    this.loading.set(true);
    this.api.get(this.id()!).subscribe({
      next: v => {
        this.form.patchValue({
          code: v.code,
          description: v.description ?? '',

          discountType: v.discountType,
          discountValue: v.discountType === 'free' ? 0 : v.discountValue,
          maxDiscountAmount: v.maxDiscountAmount ?? null,

          minOrderAmount: v.minOrderAmount ?? null,
          minShippingFee: v.minShippingFee ?? null,

          applicableCarriers: v.applicableCarriers ?? '',
          regionInclude: v.regionInclude ?? '',
          regionExclude: v.regionExclude ?? '',

          maxUses: v.maxUses ?? null,
          maxUsesPerUser: v.maxUsesPerUser ?? null,

          startDate: v.startDate ? v.startDate.substring(0,16) : null,
          endDate: v.endDate ? v.endDate.substring(0,16) : null,
          active: v.active
        });
        this.loading.set(false);
      },
      error: err => { alert(err?.error?.error || 'Không tải được dữ liệu'); this.loading.set(false); }
    });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload = { ...this.form.value };
    // ép rule cho free
    if (payload.discountType === 'free') {
      payload.discountValue = 0;
      payload.maxDiscountAmount = null;
    }
    const conv = (v: any) => v ? new Date(v).toISOString().slice(0,19) : null;
    (payload as any).startDate = conv(payload.startDate);
    (payload as any).endDate = conv(payload.endDate);

    this.submitting.set(true);
    const obs = this.id()
      ? this.api.update(this.id()!, payload)
      : this.api.create(payload);

    obs.subscribe({
      next: _ => this.router.navigateByUrl('/admin/shipping-vouchers'),
      error: err => { alert(err?.error?.error || 'Lưu thất bại'); this.submitting.set(false); }
    });
  }
}
