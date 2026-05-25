import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, shareReplay } from 'rxjs';
import { Brand } from '../../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private cache$?: Observable<Brand[]>;

  getAll(): Observable<Brand[]> {
    if (!this.cache$) {
      this.cache$ = this.http
        .get<any>(`${this.base}/brands`)
        .pipe(
          map((res) => {
            if (Array.isArray(res)) return res as Brand[];
            if (Array.isArray(res?.content)) return res.content as Brand[];
            return [];
          }),
          shareReplay(1)
        );
    }
    return this.cache$;
  }
}
