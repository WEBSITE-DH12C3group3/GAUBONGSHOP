import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment'; // <-- nhớ đường dẫn alias của bạn

export interface ChatMsg {
  role: 'user' | 'bot';
  text: string;
  meta?: { source?: 'faq' | 'ai'; confidence?: number };
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  // Trỏ đúng backend: http://localhost:8080/api/chat (theo environment bạn gửi)
  private base = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  send(message: string) {
    return this.http.post<{ answer: string; source: 'faq' | 'ai'; confidence: number }>(
      this.base,
      {
        message,
        sessionId: this.getSessionId()
      }
    );
  }

  private getSessionId() {
    let sid = sessionStorage.getItem('chat_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('chat_sid', sid);
    }
    return sid;
  }
}
