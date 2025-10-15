import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';
import { Brand } from '../../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private cache$?: Observable<Brand[]>;

  getAll(): Observable<Brand[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Brand[]>(`${this.base}/brands`).pipe(shareReplay(1));
    }
    return this.cache$;
  }
}
