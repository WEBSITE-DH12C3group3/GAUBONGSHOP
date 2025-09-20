import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatClientService {
  private base = `${environment.apiUrl}/client/chat`;
  constructor(private http: HttpClient) {}

  openWithAdmin(): Observable<ChatSessionResponse> {
    return this.http.post<ChatSessionResponse>(`${this.base}/sessions/with-admin`, {});
  }

  mySessions(page=0, size=20) {
    return this.http.get<any>(`${this.base}/sessions`, { params: { page, size }});
  }

  messages(sessionId: number, page=0, size=50) {
    return this.http.get<any>(`${this.base}/sessions/${sessionId}/messages`, { params: { page, size }});
  }

  send(sessionId: number, content: string): Observable<MessageDTO> {
    return this.http.post<MessageDTO>(`${this.base}/sessions/${sessionId}/messages`, { content });
  }

  markRead(sessionId: number) {
    return this.http.patch(`${this.base}/sessions/${sessionId}/read`, {});
  }
}
