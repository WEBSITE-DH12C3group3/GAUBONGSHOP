import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';
import { Observable } from 'rxjs';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-based)
  size: number;         // page size
}

@Injectable({ providedIn: 'root' })
export class ChatClientService {
  private readonly base = `${environment.apiUrl}/client/chat`;

  constructor(private http: HttpClient) {}

  /** Mở/tạo session với admin và trả về DTO của chính session đó */
  openWithAdmin(): Observable<ChatSessionResponse> {
    // ✅ BE: GET /api/client/chat/sessions/with-admin
    return this.http.get<ChatSessionResponse>(`${this.base}/sessions/with-admin`);
  }

  /** Danh sách các phiên chat của user (Page<ChatSessionResponse>) */
  mySessions(page = 0, size = 20): Observable<Page<ChatSessionResponse>> {
    return this.http.get<Page<ChatSessionResponse>>(
      `${this.base}/sessions`,
      { params: { page, size } as any }
    );
  }

  /** Tin nhắn của một phiên — FE mong đợi ARRAY */
  messages(sessionId: number, page = 0, size = 50): Observable<MessageDTO[]> {
    // ✅ BE trả Page<MessageDTO> → controller đã .getContent() để trả mảng
    return this.http.get<MessageDTO[]>(
      `${this.base}/sessions/${sessionId}/messages`,
      { params: { page, size } as any }
    );
  }

  /** Gửi tin nhắn (body: { text, sessionId }) */
  send(sessionId: number, text: string): Observable<MessageDTO> {
    // ✅ BE: POST /api/client/chat/messages
    return this.http.post<MessageDTO>(`${this.base}/messages`, { text, sessionId });
  }

  /** Đánh dấu đã đọc toàn bộ tin trong phiên */
  markRead(sessionId: number): Observable<void> {
    // ✅ BE: POST /api/client/chat/sessions/{id}/read
    return this.http.post<void>(`${this.base}/sessions/${sessionId}/read`, {});
  }

  /* ----------------- (Tuỳ chọn) Legacy endpoints để tương thích cũ ----------------- */

  /** Legacy: nếu còn nơi gọi POST /sessions/{id}/messages { content } */
  sendLegacy(sessionId: number, content: string): Observable<MessageDTO> {
    return this.http.post<MessageDTO>(`${this.base}/sessions/${sessionId}/messages`, { content });
  }
}
