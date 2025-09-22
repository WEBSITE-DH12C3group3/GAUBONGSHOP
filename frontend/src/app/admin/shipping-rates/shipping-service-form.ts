import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ShippingServiceAdminService } from '../../shared/services/shipping-service-admin.service';

@Component({
  selector: 'app-shipping-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="p-5 max-w-3xl">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">{{ id ? 'Sửa dịch vụ' : 'Thêm dịch vụ' }}</h2>
      <button type="button" (click)="cancel()" class="px-3 py-2 rounded-xl border hover:bg-gray-50">
        ← Quay về dịch vụ
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-1">Carrier ID</label>
        <input class="border rounded-xl px-3 py-2 w-full" formControlName="carrierId" [readonly]="!!id">
      </div>
      <div>
        <label class="block text-sm mb-1">Mã dịch vụ (code)</label>
        <input class="border rounded-xl px-3 py-2 w-full" formControlName="code">
        <div class="text-xs text-gray-500 mt-1">VD: STD, FAST, EXP…</div>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm mb-1">Tên hiển thị (label)</label>
        <input class="border rounded-xl px-3 py-2 w-full" formControlName="label">
      </div>

      <div>
        <label class="block text-sm mb-1">ETA tối thiểu (ngày)</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="baseDaysMin">
      </div>
      <div>
        <label class="block text-sm mb-1">ETA tối đa (ngày)</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="baseDaysMax">
      </div>

      <div class="flex items-center gap-2 md:col-span-2">
        <input id="active" type="checkbox" formControlName="active">
        <label for="active">Kích hoạt</label>
      </div>

      <div class="md:col-span-2 flex gap-2 pt-2">
        <button class="px-4 py-2 rounded-xl bg-pink-600 text-white" [disabled]="saving">
          {{ saving ? 'Đang lưu...' : (id ? 'Cập nhật' : 'Tạo mới') }}
        </button>
        <button type="button" (click)="cancel()" class="px-4 py-2 rounded-xl border">
          Huỷ
        </button>
      </div>
    </form>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ShippingServiceFormComponent implements OnInit {
  id?: number;
  form!: FormGroup;
  saving = false;

  /** lưu lại carrierId lấy từ dữ liệu khi edit (phòng trường hợp form bị đổi) */
  private carrierIdSnapshot?: number;

  constructor(
    private fb: FormBuilder,
    private api: ShippingServiceAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      carrierId: [null, [Validators.required]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      label: ['', [Validators.required, Validators.maxLength(120)]],
      baseDaysMin: [1, [Validators.required, Validators.min(0)]],
      baseDaysMax: [2, [Validators.required, Validators.min(0)]],
      active: [true]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const qCarrierId = this.route.snapshot.queryParamMap.get('carrierId');

    this.id = idParam ? +idParam : undefined;
    if (qCarrierId) {
      const cid = +qCarrierId;
      this.form.patchValue({ carrierId: cid });
      this.carrierIdSnapshot = cid;
    }

    if (this.id) {
      this.api.get(this.id).subscribe(v => {
        this.form.patchValue(v);
        // lưu snapshot carrierId từ dữ liệu BE để điều hướng an toàn
        if (v && (v as any).carrierId) {
          this.carrierIdSnapshot = (v as any).carrierId;
        }
        this.cdr.detectChanges();
      });
    }
  }

  /** Điều hướng về danh sách dịch vụ theo carrier */
  private goBackToServiceList(cid?: number) {
    const carrierId = cid ?? this.form.value['carrierId'] ?? this.carrierIdSnapshot;
    if (carrierId) {
      this.router.navigate(['/admin/shipping-rates/services/by-carrier', carrierId]);
    } else {
      // fallback: quay về root module quản lý vận chuyển
      this.router.navigate(['/admin/shipping-rates']);
    }
  }

  cancel(): void {
    this.goBackToServiceList();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true; this.cdr.detectChanges();

    const payload = this.form.value;
    const obs = this.id
      ? this.api.update(this.id!, payload)
      : this.api.create(payload);

    obs.pipe(finalize(() => {
      this.saving = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res: any) => {
        // Điều hướng về list theo carrier dựa trên res/carrierId hiện tại
        const cid = res?.carrierId ?? this.form.value['carrierId'] ?? this.carrierIdSnapshot;
        this.goBackToServiceList(cid);
      }
    });
  }
}
