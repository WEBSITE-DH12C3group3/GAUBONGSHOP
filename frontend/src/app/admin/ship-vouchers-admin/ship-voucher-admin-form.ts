// src/app/admin/ship-vouchers-admin/ship-voucher-admin-form.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShipVoucherAdminService } from '../../shared/services/ship-voucher-admin.service';
import { ShipVoucher, DiscountType } from '../../models/ship-voucher.model';

@Component({
  standalone: true,
  selector: 'app-ship-voucher-admin-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ship-voucher-admin-form.html'
})
export class ShipVoucherAdminFormComponent implements OnInit {
  private api = inject(ShipVoucherAdminService);
  private route = inject(ActivatedRoute);

  DiscountType = { FREE: 'FREE', PERCENT: 'PERCENT', FIXED: 'FIXED' } as const;

  id?: number;
  model = signal<ShipVoucher>({
    code: '', description: '',
    discountType: 'fixed', 
    discountValue: 0,
    maxDiscountAmount: null,
    minOrderAmount: null,
    startAt: '', endAt: '',
    usageLimit: null,
    active: true
  });

  loading = signal(false);

  ngOnInit(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) { this.id = id; this.load(id); }
  }

  load(id: number){
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (r:any) => { this.model.set(r.voucher || r); this.loading.set(false); },
      error: _ => this.loading.set(false)
    });
  }

  save() {
  const payload: any = { ...this.model() };

  // đồng bộ key ngày cũ nếu còn
  if (payload.startDate && !payload.startAt) payload.startAt = payload.startDate;
  if (payload.endDate && !payload.endAt) payload.endAt = payload.endDate;
  delete payload.startDate; delete payload.endDate;

  // ⭐ QUAN TRỌNG: enum gửi BE phải UPPERCASE
  if (payload.discountType) {
    payload.discountType = String(payload.discountType).toUpperCase(); // FREE/PERCENT/FIXED
  }

  this.loading.set(true);
  const req = this.id
    ? this.api.update(this.id, payload)
    : this.api.create(payload);

  req.subscribe({
    next: _ => { this.loading.set(false); history.back(); },
    error: err => { alert(err?.error?.error || 'Lỗi lưu'); this.loading.set(false); }
  });
}

}
