import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { ShippingService as ServiceModel } from '../../models/shipping-service.model';

@Injectable({ providedIn: 'root' })
export class ShippingServiceAdminService {
  private base = `${environment.apiUrl}/admin/shipping/services`;

  constructor(private http: HttpClient) {}

  byCarrier(carrierId: number): Observable<ServiceModel[]> {
    return this.http.get<any>(`${this.base}/by-carrier/${carrierId}`).pipe(
      map(r => Array.isArray(r) ? r : (r?.items ?? []))
    );
  }

  get(id: number): Observable<ServiceModel> {
    return this.http.get<ServiceModel>(`${this.base}/${id}`);
  }

  create(payload: any): Observable<ServiceModel> {
    return this.http.post<ServiceModel>(this.base, payload);
  }

  update(id: number, payload: any): Observable<ServiceModel> {
    return this.http.put<ServiceModel>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  setActive(id: number, value: boolean) {
    return this.http.patch<ServiceModel>(`${this.base}/${id}/active`, null, { params: { value } });
  }
}
