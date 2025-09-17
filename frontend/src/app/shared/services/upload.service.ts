// src/app/shared/services/upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

interface UploadResp { url: string; filename?: string; size?: number; uploadedAt?: string; }

@Injectable({ providedIn: 'root' })
export class UploadService {
  private api = `${environment.apiUrl}/admin/uploads`;

  constructor(private http: HttpClient) {}

  upload(file: File, target: 'product'|'brand' = 'product'): Observable<UploadResp> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<any>(`${this.api}?target=${target}`, form).pipe(
      map(r => ({ url: r?.url, filename: r?.filename, size: r?.size, uploadedAt: r?.uploadedAt }))
    );
  }
}
