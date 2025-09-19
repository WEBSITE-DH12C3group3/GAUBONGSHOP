import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { ChatSessionDTO, MessageDTO, PageResponse } from '../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  meId(): number {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      return Number(u?.id || 0);
    } catch { return 0; }
  }

  // CLIENT
  openWithAdmin(): Observable<ChatSessionDTO> {
    return this.http.post<ChatSessionDTO>(`${this.base}/client/chat/sessions/with-admin`, {});
  }
  myMessages(sessionId: number, page=0, size=50): Observable<PageResponse<MessageDTO>> {
    return this.http.get<PageResponse<MessageDTO>>(`${this.base}/client/chat/sessions/${sessionId}/messages?page=${page}&size=${size}`);
  }
  sendClient(sessionId: number, content: string): Observable<MessageDTO> {
    return this.http.post<MessageDTO>(`${this.base}/client/chat/sessions/${sessionId}/messages`, { content });
  }
  markRead(sessionId: number): Observable<number> {
    return this.http.patch<number>(`${this.base}/client/chat/sessions/${sessionId}/read`, {});
  }
  clientUnreadNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/client/chat/notifications/unread`);
  }

  // ADMIN
  adminSessions(status='open', page=0, size=50): Observable<PageResponse<ChatSessionDTO>> {
    return this.http.get<PageResponse<ChatSessionDTO>>(`${this.base}/admin/chat/sessions?status=${status}&page=${page}&size=${size}`);
  }
  adminMessages(sessionId: number, page=0, size=200): Observable<PageResponse<MessageDTO>> {
    return this.http.get<PageResponse<MessageDTO>>(`${this.base}/admin/chat/sessions/${sessionId}/messages?page=${page}&size=${size}`);
  }
  adminReply(sessionId: number, content: string): Observable<MessageDTO> {
    return this.http.post<MessageDTO>(`${this.base}/admin/chat/sessions/${sessionId}/reply`, { content });
  }
  adminClose(sessionId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/admin/chat/sessions/${sessionId}/close`, {});
  }
  adminMarkRead(sessionId: number): Observable<number> {
    return this.http.patch<number>(`${this.base}/admin/chat/sessions/${sessionId}/read`, {});
  }
}
