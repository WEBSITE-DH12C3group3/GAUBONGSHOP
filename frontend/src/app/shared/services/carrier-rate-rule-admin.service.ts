import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CarrierRateRule } from '../../models/carrier-rate-rule.model';

@Injectable({ providedIn: 'root' })
export class CarrierRateRuleAdminService {
  private base = `${environment.apiUrl}/admin/shipping/rate-rules`;
  constructor(private http: HttpClient) {}

  byService(serviceId:number): Observable<CarrierRateRule[]> {
    return this.http.get<CarrierRateRule[]>(`${this.base}/by-service/${serviceId}`);
  }
  get(id:number){ return this.http.get<CarrierRateRule>(`${this.base}/${id}`); }
  create(payload: CarrierRateRule){ return this.http.post<CarrierRateRule>(this.base, payload); }
  update(id:number, payload: CarrierRateRule){ return this.http.put<CarrierRateRule>(`${this.base}/${id}`, payload); }
  toggle(id:number){ return this.http.patch<CarrierRateRule>(`${this.base}/${id}/toggle`, {}); }
  delete(id:number){ return this.http.delete<void>(`${this.base}/${id}`); }
}
