import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // nếu bạn có alias @environments thì dùng: import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { StatsFilter, SummaryDto, TimeSeriesPoint, KeyValue, TopProductDto } from './models';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  // ✅ Ghép với environment.apiUrl -> http://localhost:8080/api/admin/stats
  private readonly base = `${environment.apiUrl}/admin/stats`;
  private readonly http = inject(HttpClient);

  summary(f: StatsFilter): Observable<SummaryDto> {
    return this.http.post<SummaryDto>(`${this.base}/summary`, f ?? {});
  }
  series(f: StatsFilter): Observable<TimeSeriesPoint[]> {
    return this.http.post<TimeSeriesPoint[]>(`${this.base}/series`, f ?? {});
  }
  topProducts(f: StatsFilter): Observable<TopProductDto[]> {
    return this.http.post<TopProductDto[]>(`${this.base}/top-products`, f ?? {});
  }
  byCategory(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/by-category`, f ?? {});
  }
  byBrand(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/by-brand`, f ?? {});
  }
  payments(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/payments`, f ?? {});
  }
  shipping(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/shipping`, f ?? {});
  }
  coupons(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/coupons`, f ?? {});
  }
  shipVouchers(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/ship-vouchers`, f ?? {});
  }
  topCustomers(f: StatsFilter): Observable<KeyValue[]> {
    return this.http.post<KeyValue[]>(`${this.base}/top-customers`, f ?? {});
  }
}
