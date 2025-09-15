import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, BrandResponse } from '../../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandAdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin/brands`;

  constructor(private http: HttpClient) {}

  private normalizeBrand = (b: any): Brand => ({
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    logoUrl: b.logoUrl ?? b.logo_url ?? undefined,
    websiteUrl: b.websiteUrl ?? b.website_url ?? undefined,
    logo_url: b.logo_url ?? b.logoUrl ?? undefined,
    website_url: b.website_url ?? b.websiteUrl ?? undefined,
    created_at: b.created_at ?? b.createdAt ?? undefined,
  });

  private normalizeList = (raw: any): BrandResponse => {
    const items = Array.isArray(raw?.items) ? raw.items.map(this.normalizeBrand) : [];
    return {
      items,
      page: raw?.page ?? 0,
      size: raw?.size ?? items.length,
      totalPages: raw?.totalPages ?? 1,
      total: raw?.totalElements,
    };
  };

  getBrands(q = '', page = 0, size = 10, sort = 'id,desc'): Observable<BrandResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', sort);
    if (q) params = params.set('q', q);

    return this.http.get<any>(this.apiUrl, { params }).pipe(map(this.normalizeList));
  }

  getById(id: number): Observable<Brand> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  create(brand: { name: string; description?: string; websiteUrl?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.post<any>(this.apiUrl, brand)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  update(id: number, brand: { name: string; description?: string; websiteUrl?: string; logoUrl?: string }): Observable<Brand> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, brand)
      .pipe(map(r => this.normalizeBrand(r?.brand ?? r)));
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
