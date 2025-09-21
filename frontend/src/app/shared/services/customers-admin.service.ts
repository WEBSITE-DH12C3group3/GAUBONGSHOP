// src/app/shared/services/customers-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';

export type CustomerStatus = 'ACTIVE'|'INACTIVE'|'BANNED';
export type CustomerTier   = 'DONG'|'BAC'|'VANG'|'BACHKIM'|'KIMCUONG';

export interface CustomerDTO {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
  tier: CustomerTier;
  points: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersAdminService {
  private base = `${environment.apiUrl}/admin/customers`;

  constructor(private http: HttpClient) {}

  search(params: {
    q?: string; status?: CustomerStatus; tier?: CustomerTier;
    createdFrom?: string; createdTo?: string;
    page?: number; size?: number; sort?: string;
  }): Observable<Page<CustomerDTO>> {
    let p = new HttpParams();
    Object.entries(params || {}).forEach(([k,v]) => {
      if (v!==undefined && v!==null && v!=='') p = p.set(k, String(v));
    });
    return this.http.get<any>(this.base, { params: p }).pipe(
      map((raw: any): Page<CustomerDTO> => {
        const content: CustomerDTO[] = Array.isArray(raw?.content) ? raw.content : (raw?.items ?? []);
        return {
          content,
          items: content,
          number: raw?.number ?? raw?.page ?? (params.page ?? 0),
          size: raw?.size ?? (params.size ?? 10),
          totalPages: raw?.totalPages ?? 1,
          totalElements: raw?.totalElements ?? content.length,
        };
      })
    );
  }

  get(id: number) { return this.http.get<CustomerDTO>(`${this.base}/${id}`); }
  create(body: Partial<CustomerDTO> & { password: string }) { return this.http.post<CustomerDTO>(this.base, body); }
  update(id: number, body: Partial<CustomerDTO> & { password?: string }) { return this.http.put<CustomerDTO>(`${this.base}/${id}`, body); }
  remove(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }

  setStatus(id: number, status: CustomerStatus) {
    return this.http.patch<CustomerDTO>(`${this.base}/${id}/status`, null, { params: { status }});
  }
  setTier(id: number, tier: CustomerTier) {
    return this.http.patch<CustomerDTO>(`${this.base}/${id}/tier`, null, { params: { tier }});
  }
}
