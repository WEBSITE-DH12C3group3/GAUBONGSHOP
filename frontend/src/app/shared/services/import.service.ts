import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImportModel } from '../../models/import.model';
import { ImportDetailModel } from '../../models/import-detail.model'; 

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private apiUrl = 'http://localhost:8080/api/admin/imports';
  private apiDetailUrl = 'http://localhost:8080/api/admin/import-details';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ImportModel[]> {
    return this.http.get<ImportModel[]>(this.apiUrl);
  }

  search(keyword: string, status: string): Observable<ImportModel[]> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (status) params = params.set('status', status);
    return this.http.get<ImportModel[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ImportModel> {
    return this.http.get<ImportModel>(`${this.apiUrl}/${id}`);
  }

  create(importData: any): Observable<any> {
  return this.http.post<any>(this.apiUrl, importData);
}


  update(id: number, importData: ImportModel): Observable<ImportModel> {
    return this.http.put<ImportModel>(`${this.apiUrl}/${id}`, importData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✅ Lấy chi tiết phiếu nhập
  getImportDetails(importId: number): Observable<ImportDetailModel[]> {
    return this.http.get<ImportDetailModel[]>(`${this.apiDetailUrl}/import/${importId}`);
  }
}
