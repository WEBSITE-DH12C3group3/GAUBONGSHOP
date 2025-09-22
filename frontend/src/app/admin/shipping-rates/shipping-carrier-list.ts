import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, switchMap, debounceTime, distinctUntilChanged, of, finalize } from 'rxjs';

import { ShippingCarrierAdminService } from '../../shared/services/shipping-carrier-admin.service';
import { ShippingCarrier } from '../../models/shipping-carrier.model';

@Component({
  selector: 'app-shipping-carrier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shipping-carrier-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShippingCarrierListComponent implements OnInit, OnDestroy {
  rows: ShippingCarrier[] = [];
  page = 0; size = 10; total = 0;
  sort = 'code,asc';
  q = '';
  active: 'all' | 'true' | 'false' = 'all';
  loading = false;

  private search$ = new Subject<void>();
  private sub?: Subscription;

  constructor(
    private api: ShippingCarrierAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // debounce cho search/filter để tránh spam API
    this.sub = this.search$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(() => {
          this.loading = true;
          this.cdr.detectChanges();
          const act = this.active === 'all' ? undefined : this.active === 'true';
          return this.api.list(this.page, this.size, this.sort, this.q, act)
            .pipe(finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            }));
        })
      )
      .subscribe({
        next: (res: any) => {
          this.rows = res?.content ?? [];
          this.total = res?.totalElements ?? 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.rows = [];
          this.total = 0;
          this.cdr.detectChanges();
        }
      });

    // load lần đầu
    this.triggerLoad();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  triggerLoad(): void {
    this.search$.next();
  }

    load(): void {
    this.triggerLoad();
  }

  onSort(field: string): void {
    const isAsc = this.sort === `${field},asc`;
    this.sort = `${field},${isAsc ? 'desc' : 'asc'}`;
    this.page = 0;
    this.triggerLoad();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.triggerLoad();
  }

  onToggle(row: ShippingCarrier): void {
    this.api.toggle(row.id!)
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: (r) => {
          row.active = r.active;
          this.cdr.detectChanges();
        }
      });
  }

  onDelete(id: number): void {
    if (!confirm('Xoá carrier này?')) return;
    this.api.delete(id)
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: () => this.triggerLoad()
      });
  }

  // gọi từ template khi gõ tìm kiếm hoặc đổi filter
  onQueryChange(): void {
    this.page = 0;
    this.triggerLoad();
  }
}
