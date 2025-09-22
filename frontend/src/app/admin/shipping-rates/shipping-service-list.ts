import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest, finalize, map, distinctUntilChanged, filter } from 'rxjs';

import { ShippingService } from '../../models/shipping-service.model';
import { ShippingServiceAdminService } from '../../shared/services/shipping-service-admin.service';

@Component({
  selector: 'app-shipping-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shipping-service-list.html',
  changeDetection: ChangeDetectionStrategy.Default   // dùng Default để loại trừ vấn đề CD
})
export class ShippingServiceListComponent implements OnInit, OnDestroy {
  carrierId!: number;
  rows: ShippingService[] = [];
  loading = false;

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,                 // <-- inject Router
    private api: ShippingServiceAdminService,
    private cdr: ChangeDetectorRef
  ) {
    // Giữ nguyên: đọc param ngay khi khởi tạo
    this.sub = this.route.paramMap.subscribe(pm => {
      const cid = pm.get('carrierId');
      this.carrierId = cid ? +cid : NaN;
      if (!isNaN(this.carrierId)) this.load();
    });
  }

  ngOnInit(): void {
    // Giữ nguyên: Lấy carrierId từ cả param và query; tự reload khi đổi
    this.sub = combineLatest([
      this.route.paramMap.pipe(map(p => p.get('carrierId'))),
      this.route.queryParamMap.pipe(map(q => q.get('carrierId')))
    ])
    .pipe(
      map(([p, q]) => +(p ?? q ?? 'NaN')),
      filter(id => !Number.isNaN(id)),
      distinctUntilChanged()
    )
    .subscribe(id => {
      this.carrierId = id;
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.api.byCarrier(this.carrierId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: res => {
          this.rows = res ?? [];
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('[ServiceList] API error:', err);
          this.rows = [];
          this.cdr.detectChanges();
        }
      });
  }

  goCreate(): void {
    this.router.navigate(
      ['/admin/shipping-rates/services/new'],
      { queryParams: { carrierId: this.carrierId } }
    );
  }

  // Nút mới: quay về danh sách hãng
  backToCarrierList(): void {
    this.router.navigate(['/admin/shipping-rates']);
  }
}
