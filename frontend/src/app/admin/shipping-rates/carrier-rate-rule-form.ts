import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CarrierRateRuleAdminService } from '../../shared/services/carrier-rate-rule-admin.service';

@Component({
  selector: 'app-carrier-rate-rule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="p-5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">{{ id ? 'Sửa' : 'Thêm' }} quy tắc phí</h2>
      <button type="button" (click)="cancel()" class="px-3 py-2 rounded-xl border hover:bg-gray-50">
        ← Quay về danh sách rule
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label class="block text-sm">Service ID</label>
        <input class="border rounded-xl px-3 py-2 w-full" formControlName="serviceId" [readonly]="!!id">
      </div>
      <div><label class="block text-sm">Từ km</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="minKm">
      </div>
      <div><label class="block text-sm">Đến km (rỗng = ∞)</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="maxKm">
      </div>
      <div><label class="block text-sm">Base fee</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="baseFee">
      </div>
      <div><label class="block text-sm">Phí /km</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="perKmFee">
      </div>
      <div><label class="block text-sm">Min fee</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="minFee">
      </div>
      <div><label class="block text-sm">Free km</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="freeKm">
      </div>
      <div><label class="block text-sm">COD surcharge</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="codSurcharge">
      </div>
      <div><label class="block text-sm">Area surcharge</label>
        <input type="number" class="border rounded-xl px-3 py-2 w-full" formControlName="areaSurcharge">
      </div>
      <div><label class="block text-sm">Hiệu lực từ</label>
        <input type="date" class="border rounded-xl px-3 py-2 w-full" formControlName="activeFrom">
      </div>
      <div><label class="block text-sm">Hiệu lực đến</label>
        <input type="date" class="border rounded-xl px-3 py-2 w-full" formControlName="activeTo">
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" formControlName="active" id="active">
        <label for="active">Kích hoạt</label>
      </div>

      <div class="col-span-full flex gap-2 pt-2">
        <button class="px-4 py-2 rounded-xl bg-pink-600 text-white" [disabled]="saving">
          {{ saving ? 'Đang lưu...' : (id ? 'Cập nhật' : 'Tạo mới') }}
        </button>
        <!-- Đổi từ routerLink sang click để điều hướng an toàn -->
        <button type="button" (click)="cancel()" class="px-4 py-2 rounded-xl border">
          Huỷ
        </button>
      </div>
    </form>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
export class CarrierRateRuleFormComponent implements OnInit {
  id?: number;
  form!: FormGroup;
  saving = false;

  /** lưu lại serviceId & carrierId để điều hướng an toàn */
  private serviceIdSnapshot?: number;
  private carrierIdSnapshot?: number;

  constructor(
    private fb: FormBuilder,
    private api: CarrierRateRuleAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      serviceId: [null, [Validators.required]],
      minKm: [0, [Validators.required, Validators.min(0)]],
      maxKm: [null],
      baseFee: [0, [Validators.required, Validators.min(0)]],
      perKmFee: [0, [Validators.required, Validators.min(0)]],
      minFee: [0, [Validators.min(0)]],
      freeKm: [0, [Validators.min(0)]],
      codSurcharge: [0, [Validators.min(0)]],
      areaSurcharge: [0, [Validators.min(0)]],
      activeFrom: [null],
      activeTo: [null],
      active: [true]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const qServiceId = this.route.snapshot.queryParamMap.get('serviceId');
    const qCarrierId = this.route.snapshot.queryParamMap.get('carrierId');

    this.id = idParam ? +idParam : undefined;

    if (qServiceId) {
      const sid = +qServiceId;
      this.form.patchValue({ serviceId: sid });
      this.serviceIdSnapshot = sid;
    }
    if (qCarrierId) {
      this.carrierIdSnapshot = +qCarrierId;
    }

    if (this.id) {
      this.api.get(this.id).subscribe(v => {
        this.form.patchValue(v);
        // nếu BE trả về serviceId, lưu snapshot để điều hướng
        const sid = (v as any)?.serviceId;
        if (sid) this.serviceIdSnapshot = sid;
        this.cdr.detectChanges();
      });
    }
  }

  /** Điều hướng về danh sách rule theo service, giữ lại carrierId nếu có */
  private goBackToRuleList(serviceId?: number) {
    const sid = serviceId ?? this.form.value['serviceId'] ?? this.serviceIdSnapshot;
    if (sid) {
      const queryParams = this.carrierIdSnapshot ? { carrierId: this.carrierIdSnapshot } : undefined;
      this.router.navigate(['/admin/shipping-rates/rules/by-service', sid], { queryParams });
    } else {
      // fallback: về module quản lý vận chuyển
      this.router.navigate(['/admin/shipping-rates']);
    }
  }

  cancel(): void {
    this.goBackToRuleList();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true; this.cdr.detectChanges();

    const payload = this.form.value;
    const obs = this.id ? this.api.update(this.id!, payload)
                        : this.api.create(payload);

    obs.pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); }))
       .subscribe({
         next: (res) => {
           const sid = (res as any)?.serviceId ?? this.form.value['serviceId'] ?? this.serviceIdSnapshot;
           this.goBackToRuleList(sid);
         }
       });
  }
}
