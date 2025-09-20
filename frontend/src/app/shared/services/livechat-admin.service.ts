import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatSocketService } from './chat-socket.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class LivechatAdminService {
  private base = `${environment.apiUrl}/admin/chat`;

  // state
  private sessions = new Map<number, ChatSessionResponse>();
  private _sessions$ = new BehaviorSubject<ChatSessionResponse[]>([]);
  private _unreadTotal$ = new BehaviorSubject<number>(0);
  private activeSessionId: number | null = null;
  private boundSessions = new Set<number>();

  sessions$ = this._sessions$.asObservable();
  unreadTotal$ = this._unreadTotal$.asObservable();

  constructor(private http: HttpClient, private socket: ChatSocketService) {}

  initSocket(getAuthHeader: () => Record<string,string>) {
    console.log('[chat] initSocket');
    this.socket.init(getAuthHeader);
    const ch = this.socket.sub('private-admin.livechat');
    ch.bind('session:updated', () => {
        console.log('[chat] session:updated');
        this.reload();
    });  }

    reload() {
    console.log('[chat] reload');
    this.http.get<any>(`${this.base}/sessions`, { params: { page: 0, size: 100 }})
        .subscribe(res => {
        const list: ChatSessionResponse[] = res.content ?? res.items ?? [];
        this.sessions.clear();
        list.forEach(s => this.sessions.set(s.id, s));

        list.forEach(s => {
            if (this.boundSessions.has(s.id)) return; // ⛔️ đã bind rồi
            const ch = this.socket.sub(`private-chat.${s.id}`);
            ch.bind('message:new', (p: any) => {
            const ss = this.sessions.get(s.id);
            if (!ss) return;
            ss.lastMessageSnippet = p?.message?.content ?? ss.lastMessageSnippet;
            if (this.activeSessionId !== s.id) {
                ss.unreadForViewer = (ss.unreadForViewer ?? 0) + 1;
            }
            this.emit();
            });
            ch.bind('message:read', (_: any) => {/* optional */});
            this.boundSessions.add(s.id);
        });

        this.emit();
        });
    }

  setActive(id: number | null) {
    this.activeSessionId = id;
    if (id) this.http.patch(`${this.base}/sessions/${id}/read`, {}).subscribe(() => {
      const s = this.sessions.get(id);
      if (s) { s.unreadForViewer = 0; this.emit(); }
    });
  }

  messages(sessionId: number, page=0, size=50) {
    return this.http.get<any>(`${this.base}/sessions/${sessionId}/messages`, { params: { page, size }});
  }

  send(sessionId: number, content: string) {
    return this.http.post<MessageDTO>(`${this.base}/sessions/${sessionId}/messages`, { content });
  }

  private emit() {
    const arr = Array.from(this.sessions.values())
      .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    this._sessions$.next(arr);
    const total = arr.reduce((sum, x) => sum + (x.unreadForViewer ?? 0), 0);
    this._unreadTotal$.next(total);
  }
}
