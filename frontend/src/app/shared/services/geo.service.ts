import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AddressComponents {
  fullAddress: string;
  province: string; district: string; ward: string; street: string;
  postalCode?: string; lat?: number; lng?: number;
}
export interface SuggestItem extends AddressComponents { label: string; }

@Injectable({ providedIn: 'root' })
export class GeoService {
  private base = `${environment.apiUrl}/geo`;
  constructor(private http: HttpClient) {}

  reverse(lat: number, lng: number): Observable<AddressComponents> {
    return this.http.post<AddressComponents>(`${this.base}/reverse`, { lat, lng });
  }

  suggest(query: string, province?: string, district?: string, limit = 8): Observable<SuggestItem[]> {
    let params = new HttpParams().set('query', query).set('limit', limit);
    if (province) params = params.set('province', province);
    if (district) params = params.set('district', district);
    return this.http.get<SuggestItem[]>(`${this.base}/suggest`, { params });
  }
}