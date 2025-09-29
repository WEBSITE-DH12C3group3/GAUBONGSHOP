import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, AsyncPipe,DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsApiService } from './analytics-api.service';
import { GroupBy, KeyValue, StatsFilter, SummaryDto, TimeSeriesPoint, TopProductDto } from './models';
import Chart from 'chart.js/auto';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, DecimalPipe, NgClass, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {

  // ---- filters ----
  start = this.iso(new Date(Date.now() - 29 * 86400_000));
  end   = this.iso(new Date());
  groupBy: GroupBy = 'DAY';
  tzOffsetMinutes = - new Date().getTimezoneOffset(); // client tz

  loading = false;
  summary?: SummaryDto;
  series: TimeSeriesPoint[] = [];
  topProducts: TopProductDto[] = [];
  byCategory: KeyValue[] = [];
  byBrand: KeyValue[] = [];
  payments: KeyValue[] = [];
  shipping: KeyValue[] = [];
  coupons: KeyValue[] = [];
  shipVouchers: KeyValue[] = [];
  topCustomers: KeyValue[] = [];

  // chart instances
  private chartRevenue?: Chart;
  private chartOrders?: Chart;
  private chartCategory?: Chart;
  private chartBrand?: Chart;
  private chartPayment?: Chart;

  constructor(private api: AnalyticsApiService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  iso(d: Date) { return d.toISOString().slice(0, 10); }

  buildFilter(): StatsFilter {
    return {
      start: this.start,
      end: this.end,
      groupBy: this.groupBy,
      tzOffsetMinutes: this.tzOffsetMinutes,
      limit: 10
    };
  }

  /** Gọi toàn bộ API, chống vỡ Promise khi 1 API lỗi */
  fetchAll() {
    this.loading = true;
    const f = this.buildFilter();

    forkJoin({
      summary:      this.api.summary(f).pipe(catchError(() => of(null))),
      series:       this.api.series(f).pipe(catchError(() => of([] as TimeSeriesPoint[]))),
      topProducts:  this.api.topProducts(f).pipe(catchError(() => of([] as TopProductDto[]))),
      byCategory:   this.api.byCategory(f).pipe(catchError(() => of([] as KeyValue[]))),
      byBrand:      this.api.byBrand(f).pipe(catchError(() => of([] as KeyValue[]))),
      payments:     this.api.payments(f).pipe(catchError(() => of([] as KeyValue[]))),
      shipping:     this.api.shipping(f).pipe(catchError(() => of([] as KeyValue[]))),
      coupons:      this.api.coupons(f).pipe(catchError(() => of([] as KeyValue[]))),
      shipVouchers: this.api.shipVouchers(f).pipe(catchError(() => of([] as KeyValue[]))),
      topCustomers: this.api.topCustomers(f).pipe(catchError(() => of([] as KeyValue[]))),
    }).subscribe({
      next: (res) => {
        this.summary      = res.summary ?? undefined;
        this.series       = res.series ?? [];
        this.topProducts  = res.topProducts ?? [];
        this.byCategory   = res.byCategory ?? [];
        this.byBrand      = res.byBrand ?? [];
        this.payments     = res.payments ?? [];
        this.shipping     = res.shipping ?? [];
        this.coupons      = res.coupons ?? [];
        this.shipVouchers = res.shipVouchers ?? [];
        this.topCustomers = res.topCustomers ?? [];

        // Chờ 1 tick để chắc canvas đã render
        setTimeout(() => this.renderCharts());
      },
      complete: () => (this.loading = false)
    });
  }

  // ====== CHARTS ======
  /** Hủy toàn bộ chart cũ để tránh memory leak/overlay */
  private destroyCharts() {
    this.chartRevenue?.destroy();  this.chartRevenue = undefined;
    this.chartOrders?.destroy();   this.chartOrders = undefined;
    this.chartCategory?.destroy(); this.chartCategory = undefined;
    this.chartBrand?.destroy();    this.chartBrand = undefined;
    this.chartPayment?.destroy();  this.chartPayment = undefined;
  }

  private getCanvas(id: string): HTMLCanvasElement | null {
    return document.getElementById(id) as HTMLCanvasElement | null;
  }

  renderCharts() {
    // Nếu đang ở môi trường SSR, bỏ qua
    if (typeof window === 'undefined') return;

    // Dữ liệu cho series
    const labels  = this.series.map(s => s.period);
    const revenue = this.series.map(s => s.netRevenue);
    const orders  = this.series.map(s => s.orders);
    const margins = this.series.map(s => s.marginPct);

    // Hủy chart cũ trước khi vẽ
    this.destroyCharts();

    // ----- Revenue & Margin (line, 2 trục) -----
    const elRevenue = this.getCanvas('chartRevenue');
    if (elRevenue) {
      this.chartRevenue = new Chart(elRevenue, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Net Revenue', data: revenue, fill: true, tension: 0.35 },
            { label: 'Margin %', data: margins, yAxisID: 'y1', tension: 0.35 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            y:  { beginAtZero: true, title: { display: true, text: '₫' } },
            y1: { beginAtZero: true, position: 'right', title: { display: true, text: '%' } }
          }
        }
      });
    }

    // ----- Orders (bar) -----
    const elOrders = this.getCanvas('chartOrders');
    if (elOrders) {
      this.chartOrders = new Chart(elOrders, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Orders', data: orders }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // ----- Category (pie) -----
    const elCat = this.getCanvas('chartCategory');
    if (elCat) {
      this.chartCategory = new Chart(elCat, {
        type: 'pie',
        data: {
          labels: this.byCategory.map(x => x.key ?? '(N/A)'),
          datasets: [{ data: this.byCategory.map(x => x.amount || 0) }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // ----- Brand (doughnut) -----
    const elBrand = this.getCanvas('chartBrand');
    if (elBrand) {
      this.chartBrand = new Chart(elBrand, {
        type: 'doughnut',
        data: {
          labels: this.byBrand.map(x => x.key ?? '(N/A)'),
          datasets: [{ data: this.byBrand.map(x => x.amount || 0) }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // ----- Payment (horizontal bar) -----
    const elPay = this.getCanvas('chartPayment');
    if (elPay) {
      this.chartPayment = new Chart(elPay, {
        type: 'bar',
        data: {
          labels: this.payments.map(x => x.key),
          datasets: [{ label: 'Amount', data: this.payments.map(x => x.amount || 0) }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } }
        }
      });
    }
  }

  onApplyFilters() {
    this.fetchAll();
  }

  // ===== helpers cho template (hiển thị "không có dữ liệu") =====
  hasSeries(): boolean { return (this.series?.length ?? 0) > 0; }
  has(arr: any[] | undefined): boolean { return (arr?.length ?? 0) > 0; }
}
