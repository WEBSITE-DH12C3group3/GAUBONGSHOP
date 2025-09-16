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

  id = signal<number|null>(null);
  loading = signal(false);
  submitting = signal(false);
  title = signal('Tạo phiếu giảm giá');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    description: [''],

    discountType: ['percent', Validators.required],
    discountValue: [10, [Validators.required, Validators.min(0)]],
    maxDiscountAmount: [null as number | null, [Validators.min(0)]],

    minOrderAmount: [null as number | null, [Validators.min(0)]],
    excludeDiscountedItems: [false],

    applicablePaymentMethods: [''],
    applicableRoles: [''],
    regionInclude: [''],
    regionExclude: [''],

    firstOrderOnly: [false],
    stackable: [false],

    maxUses: [null as number | null, [Validators.min(0)]],
    maxUsesPerUser: [null as number | null, [Validators.min(0)]],

    startDate: [null as string | null],
    endDate: [null as string | null],
    active: [true],

    categoryIdsCsv: [''],
    brandIdsCsv: [''],
    productIdsCsv: ['']
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
          maxDiscountAmount: c.maxDiscountAmount ?? null,
          minOrderAmount: c.minOrderAmount ?? null,
          excludeDiscountedItems: c.excludeDiscountedItems,
          applicablePaymentMethods: c.applicablePaymentMethods ?? '',
          applicableRoles: c.applicableRoles ?? '',
          regionInclude: c.regionInclude ?? '',
          regionExclude: c.regionExclude ?? '',
          firstOrderOnly: c.firstOrderOnly,
          stackable: c.stackable,
          maxUses: c.maxUses ?? null,
          maxUsesPerUser: c.maxUsesPerUser ?? null,
          startDate: c.startDate ? c.startDate.substring(0,16) : null,
          endDate: c.endDate ? c.endDate.substring(0,16) : null,
          active: c.active,
          categoryIdsCsv: (c.categoryIds ?? []).join(','),
          brandIdsCsv: (c.brandIds ?? []).join(','),
          productIdsCsv: (c.productIds ?? []).join(',')
        });
        this.loading.set(false);
      },
      error: err => { alert(err?.error?.error || 'Không tải được dữ liệu'); this.loading.set(false); }
    });
  }

  private parseCsvNumbers(s?: string | null): number[] {
    if (!s) return [];
    return s.split(',').map(x => x.trim()).filter(Boolean).map(x => +x).filter(n => !isNaN(n));
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value as any;

    const payload: any = {
      code: v.code,
      description: v.description,
      discountType: v.discountType,
      discountValue: +v.discountValue,
      maxDiscountAmount: v.maxDiscountAmount != null ? +v.maxDiscountAmount : null,
      minOrderAmount: v.minOrderAmount != null ? +v.minOrderAmount : null,
      excludeDiscountedItems: !!v.excludeDiscountedItems,
      applicablePaymentMethods: v.applicablePaymentMethods || null,
      applicableRoles: v.applicableRoles || null,
      regionInclude: v.regionInclude || null,
      regionExclude: v.regionExclude || null,
      firstOrderOnly: !!v.firstOrderOnly,
      stackable: !!v.stackable,
      maxUses: v.maxUses != null ? +v.maxUses : null,
      maxUsesPerUser: v.maxUsesPerUser != null ? +v.maxUsesPerUser : null,
      startDate: v.startDate ? new Date(v.startDate).toISOString().slice(0,19) : null,
      endDate: v.endDate ? new Date(v.endDate).toISOString().slice(0,19) : null,
      active: !!v.active,
      categoryIds: this.parseCsvNumbers(v.categoryIdsCsv),
      brandIds: this.parseCsvNumbers(v.brandIdsCsv),
      productIds: this.parseCsvNumbers(v.productIdsCsv)
    };

    this.submitting.set(true);
    const obs = this.id() ? this.api.update(this.id()!, payload) : this.api.create(payload);
    obs.subscribe({
      next: _ => this.router.navigateByUrl('/admin/coupons'),
      error: err => { alert(err?.error?.error || 'Lưu thất bại'); this.submitting.set(false); }
    });
  }
}
