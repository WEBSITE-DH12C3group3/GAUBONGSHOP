import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ShippingCarrier } from '../../models/shipping-carrier.model';

@Injectable({ providedIn: 'root' })
export class ShippingCarrierAdminService {
  private base = `${environment.apiUrl}/admin/shipping/carriers`;
  constructor(private http: HttpClient) {}

  list(page=0, size=10, sort='code,asc', q='', active?: boolean): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    if (q) params = params.set('q', q);
    if (active !== undefined) params = params.set('active', active);
    return this.http.get<any>(this.base, { params });
  }
  get(id:number){ return this.http.get<ShippingCarrier>(`${this.base}/${id}`); }
  create(payload: ShippingCarrier){ return this.http.post<ShippingCarrier>(this.base, payload); }
  update(id:number, payload: ShippingCarrier){ return this.http.put<ShippingCarrier>(`${this.base}/${id}`, payload); }
  toggle(id:number){ return this.http.patch<ShippingCarrier>(`${this.base}/${id}/toggle`, {}); }
  delete(id:number){ return this.http.delete<void>(`${this.base}/${id}`); }
}
