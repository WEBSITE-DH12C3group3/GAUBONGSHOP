import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  Subscription,
  combineLatest,
  map,
  distinctUntilChanged,
  filter,
  finalize,
} from 'rxjs';

import { CarrierRateRuleAdminService } from '../../shared/services/carrier-rate-rule-admin.service';
import { CarrierRateRule } from '../../models/carrier-rate-rule.model';

@Component({
  selector: 'app-carrier-rate-rule-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrier-rate-rule-list.html',
  // Dùng Default để chắc chắn render ngay khi param đổi (tránh OnPush “lười” render)
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CarrierRateRuleListComponent implements OnInit, OnDestroy {
  /** service đang xem danh sách rule */
  serviceId!: number;

  /** carrier chứa service này (nếu truyền qua queryParams) để nút "Quay về dịch vụ" biết đích */
  carrierId?: number;

  /** dữ liệu hiển thị */
  rows: CarrierRateRule[] = [];

  /** trạng thái tải */
  loading = false;

  /** chứa mọi subscription để hủy gọn */
  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: CarrierRateRuleAdminService,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    // 1) Theo dõi serviceId: ưu tiên param (/:serviceId), fallback query (?serviceId=)
    const serviceId$ = combineLatest([
      this.route.paramMap.pipe(map(pm => pm.get('serviceId'))),
      this.route.queryParamMap.pipe(map(qm => qm.get('serviceId'))),
    ])
      .pipe(
        map(([p, q]) => +(p ?? q ?? 'NaN')),
        filter(id => !Number.isNaN(id)),
        distinctUntilChanged()
      )
      .subscribe(id => {
        this.serviceId = id;
        this.load(); // mỗi khi đổi serviceId → reload
      });

    this.subs.add(serviceId$);

    // 2) Theo dõi carrierId (nếu có) để hỗ trợ nút "Quay về dịch vụ"
    const carrierId$ = this.route.queryParamMap
      .pipe(map(qm => qm.get('carrierId')))
      .subscribe(cid => {
        this.carrierId = cid ? +cid : undefined;
      });

    this.subs.add(carrierId$);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /** Gọi API lấy danh sách rule theo serviceId hiện tại */
  load(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.api
      .byService(this.serviceId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: res => {
          this.rows = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('[RuleList] API error:', err);
          this.rows = [];
          this.cdr.detectChanges();
        },
      });
  }

  /** Shim cho template cũ từng gọi load() trực tiếp */
  loadShim(): void {
    this.load();
  }

  /** Điều hướng: tạo rule mới, truyền kèm serviceId để form biết quay lại list sau khi lưu */
  goCreate(): void {
    this.router.navigate(['/admin/shipping-rates/rules/new'], {
      queryParams: { serviceId: this.serviceId, carrierId: this.carrierId },
    });
  }

  /** Điều hướng: sửa rule */
  goEdit(id: number): void {
    this.router.navigate(['/admin/shipping-rates/rules/edit', id], {
      queryParams: { carrierId: this.carrierId }, // giữ carrierId để quay về đúng list dịch vụ
    });
  }

  /** Quay về danh sách dịch vụ của carrier nếu biết carrierId, không thì quay về trang trước */
  backToServices(): void {
    if (this.carrierId) {
      // Route list dịch vụ theo hãng (đã chuẩn hoá ở routing): /admin/shipping-rates/services/by-carrier/:carrierId
      this.router.navigate(['/admin/shipping-rates/services/by-carrier', this.carrierId]);
    } else {
      // Không có carrierId → quay lại history (trường hợp đi từ nơi khác tới)
      this.location.back();
    }
  }

  /** trackBy cho *ngFor để render mượt */
  trackById = (_: number, r: CarrierRateRule) => r.id ?? r.minKm ?? _;
}
