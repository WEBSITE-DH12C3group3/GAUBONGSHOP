import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Supplier, SupplierResponse } from '../../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierAdminService {
  private readonly apiUrl = `${environment.apiUrl}/suppliers`; // backend bạn đặt public path

  constructor(private http: HttpClient) {}

  private norm = (s: any): Supplier => ({
    id: s.id,
    name: s.name,
    contactPerson: s.contactPerson ?? s.contact_person ?? undefined,
    phone: s.phone ?? undefined,
    email: s.email ?? undefined,
    address: s.address ?? undefined,
    createdAt: s.createdAt ?? s.created_at ?? undefined,
    updatedAt: s.updatedAt ?? s.updated_at ?? undefined,
    // giữ snake_case optional cho phần khác nếu trông chờ
    contact_person: s.contact_person ?? s.contactPerson ?? undefined,
    created_at: s.created_at ?? s.createdAt ?? undefined,
    updated_at: s.updated_at ?? s.updatedAt ?? undefined,
  });

  private normList = (raw: any): SupplierResponse => {
    const items = Array.isArray(raw?.items) ? raw.items.map(this.norm) : [];
    return {
      items,
      page: raw?.page ?? 0,
      size: raw?.size ?? items.length,
      totalPages: raw?.totalPages ?? 1,
      total: raw?.totalElements,
    };
  };

  list(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<SupplierResponse> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size)).set('sort', sort);
    if (q) params = params.set('q', q);
    return this.http.get<any>(this.apiUrl, { params /*, withCredentials: true*/ }).pipe(map(this.normList));
  }

  get(id: number): Observable<Supplier> {
    return this.http.get<any>(`${this.apiUrl}/${id}`/*, { withCredentials: true }*/)
      .pipe(map(r => this.norm(r?.supplier ?? r)));
  }

  create(payload: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string }): Observable<Supplier> {
    return this.http.post<any>(this.apiUrl, payload /*, { withCredentials: true }*/)
      .pipe(map(r => this.norm(r?.supplier ?? r)));
  }

  update(id: number, payload: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string }): Observable<Supplier> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload /*, { withCredentials: true }*/)
      .pipe(map(r => this.norm(r?.supplier ?? r)));
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}` /*, { withCredentials: true }*/);
  }
}
