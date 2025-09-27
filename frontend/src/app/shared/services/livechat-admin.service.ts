import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { ChatSocketService } from './chat-socket.service';
import { environment } from '../../../environments/environment';
import { ChatSessionResponse, MessageDTO } from '../../models/chat.model';

type HeadersFn = () => Record<string, string> | undefined;

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class LivechatAdminService {
  private readonly base = `${environment.apiUrl}/admin/chat`;

  /** state */
  private sessions = new Map<number, ChatSessionResponse>();
  private boundSessions = new Set<number>();
  private activeSessionId: number | null = null;

  private _sessions$ = new BehaviorSubject<ChatSessionResponse[]>([]);
  private _unreadTotal$ = new BehaviorSubject<number>(0);

  /** public streams */
  sessions$ = this._sessions$.asObservable();
  unreadTotal$ = this._unreadTotal$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly socket: ChatSocketService
  ) {}

  /** Khởi tạo socket admin; có thể truyền getHeaders (Authorization) */
  initSocket(getHeaders?: HeadersFn) {
    this.socket.init(() => getHeaders?.() || {}); // luôn trả object
    const ch = this.socket.sub('private-admin.livechat');

    // Khi có session thay đổi (tin mới, đánh dấu đọc...), reload danh sách
    this.socket.bind(ch, 'session:updated', (_payload: any) => {
      // console.debug('[livechat-admin] session:updated', payload);
      this.reload();
    });
  }

  /** Nếu token đổi sau khi login/refresh, gọi để cập nhật header cho Pusher */
  refreshAuthHeaders() {
    this.socket.refreshAuthHeaders();
  }

  /** Dọn socket/kênh (gọi khi rời trang hoặc logout) */
  dispose() {
    try {
      this.socket.unsub('private-admin.livechat');
      for (const id of this.boundSessions) {
        this.socket.unsub(`private-chat.${id}`);
      }
      this.boundSessions.clear();
      // không disconnect toàn bộ để các trang khác còn dùng; nếu cần:
      // this.socket.reset();
    } catch {}
  }

  /** Tải lại danh sách session; đồng bộ binding kênh message của từng session */
  reload() {
    // console.debug('[livechat-admin] reload');
    this.http
      .get<Page<ChatSessionResponse>>(`${this.base}/sessions`, {
        params: { page: 0, size: 100 } as any,
      })
      .subscribe((res) => {
        const list: ChatSessionResponse[] = res?.content ?? (res as any)?.items ?? [];

        // cập nhật map
        this.sessions.clear();
        for (const s of list) this.sessions.set(s.id, { ...s });

        // bind kênh của từng session (idempotent)
        for (const s of list) {
          if (this.boundSessions.has(s.id)) continue;
          const ch = this.socket.sub(`private-chat.${s.id}`);

          this.socket.bind(ch, 'message:new', (p: any) => {
            const msg: MessageDTO | undefined = p?.message ?? p;
            const ss = this.sessions.get(s.id);
            if (!ss) return;

            // cập nhật snippet + updatedAt
            if (msg?.content) ss.lastMessageSnippet = msg.content;
            // nếu BE không đẩy updatedAt, đẩy session lên đầu bằng cách sửa updatedAt client-side
            (ss as any).updatedAt = new Date().toISOString();

            // badge unread nếu không phải phiên đang mở
            if (this.activeSessionId !== s.id) {
              ss.unreadForViewer = (ss.unreadForViewer ?? 0) + 1;
            }

            this.emit();
          });

          this.socket.bind(ch, 'message:read', (_p: any) => {
            // có thể cập nhật unread ở đây nếu payload có "by" khác admin
            // hiện tại bỏ qua vì reload() đã handle tổng thể
          });

          this.boundSessions.add(s.id);
        }

        this.emit();
      });
  }

  /** Chọn session đang xem; đồng thời mark read ở backend */
  setActive(id: number | null) {
    this.activeSessionId = id;
    if (!id) return;

    this.http.post<void>(`${this.base}/sessions/${id}/read`, {}).subscribe({
      next: () => {
        const s = this.sessions.get(id);
        if (s) {
          s.unreadForViewer = 0;
          this.emit();
        }
      },
    });
  }

  /** Lấy tin nhắn 1 phiên — backend trả ARRAY */
  messages(sessionId: number, page = 0, size = 50): Observable<MessageDTO[]> {
    return this.http
      .get<MessageDTO[]>(
        `${this.base}/sessions/${sessionId}/messages`,
        { params: { page, size } as any }
      )
      .pipe(map((arr) => arr ?? []));
  }

  /** Gửi tin nhắn (admin) — dùng endpoint chuẩn mới */
  send(sessionId: number, text: string): Observable<MessageDTO> {
    return this.http.post<MessageDTO>(`${this.base}/messages`, { text, sessionId }).pipe(
      tap((m) => {
        // cập nhật session local cho mượt (socket cũng sẽ đẩy về)
        const s = this.sessions.get(sessionId);
        if (s) {
          s.lastMessageSnippet = m.content || s.lastMessageSnippet;
          (s as any).updatedAt = new Date().toISOString();
          this.emit();
        }
      })
    );
  }

  /** Tính & phát lại state ra streams */
  private emit() {
    const arr = Array.from(this.sessions.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    this._sessions$.next(arr);

    const total = arr.reduce((sum, x) => sum + (x.unreadForViewer ?? 0), 0);
    this._unreadTotal$.next(total);
  }
}
