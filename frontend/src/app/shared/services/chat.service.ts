// src/app/shared/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PusherService } from './pusher.service';

import { ChatMessage, Conversation } from '../../models/chat.model';

// Dạng trả về từ BE
type ServerConversation = {
  id: number;
  meId: number;
  peerId: number;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastMessage?: string | null;
  unreadCount?: number;
};
type ServerMessage = {
  id: number;
  sessionId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
};
type PageResp<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  private clientApi = `${environment.apiUrl}/client/chat`;
  private adminApi  = `${environment.apiUrl}/admin/chat`;

  // Cache meId cho từng session để suy ra senderType khi map message
  private meIdBySession: Record<number, number> = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private pusher: PusherService
  ) {}

  // ------------ Helpers ------------
  private isAdminContext(): boolean {
    return this.router.url.startsWith('/admin');
  }

  private mapConversation(s: ServerConversation): Conversation {
    // Lưu meId vào cache nội bộ, KHÔNG trả ra ngoài (tránh excess property)
    this.meIdBySession[s.id] = s.meId;

    const conv: Conversation = {
      id: s.id,
      lastMessage: s.lastMessage ?? undefined,
      unreadCount: s.unreadCount ?? 0,
    } as Conversation;

    return conv;
  }

  private mapMessage(m: ServerMessage): ChatMessage {
    const meId = this.meIdBySession[m.sessionId];
    const senderType = meId && m.senderId === meId ? ('ME' as any) : ('PEER' as any);

    const mapped: ChatMessage = {
      id: m.id as any,
      conversationId: m.sessionId as any,
      senderType,
      text: m.content as any,
      sentAt: m.createdAt as any,
      isRead: m.isRead as any,
      senderId: m.senderId as any,
    } as ChatMessage;

    return mapped;
  }

  // ------------ API BE “gốc” ------------
  // Client
  private openWithAdmin$(): Observable<ServerConversation> {
    return this.http.post<ServerConversation>(`${this.clientApi}/sessions/with-admin`, {});
  }
  private clientMessages$(sessionId: number, page=0, size=50): Observable<PageResp<ServerMessage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResp<ServerMessage>>(`${this.clientApi}/sessions/${sessionId}/messages`, { params });
  }
  private clientSend$(sessionId: number, content: string): Observable<ServerMessage> {
    return this.http.post<ServerMessage>(`${this.clientApi}/sessions/${sessionId}/messages`, { content });
  }
  private clientMarkRead$(sessionId: number): Observable<number> {
    return this.http.post<number>(`${this.clientApi}/sessions/${sessionId}/read`, {});
  }

  // Admin
  private adminSessions$(status?: 'open'|'closed'|'pending', page=0, size=20): Observable<PageResp<ServerConversation>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResp<ServerConversation>>(`${this.adminApi}/sessions`, { params });
  }
  private adminMessages$(sessionId: number, page=0, size=50): Observable<PageResp<ServerMessage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResp<ServerMessage>>(`${this.adminApi}/sessions/${sessionId}/messages`, { params });
  }
  private adminSend$(sessionId: number, content: string): Observable<ServerMessage> {
    return this.http.post<ServerMessage>(`${this.adminApi}/sessions/${sessionId}/messages`, { content });
  }
  private adminMarkRead$(sessionId: number): Observable<number> {
    return this.http.post<number>(`${this.adminApi}/sessions/${sessionId}/read`, {});
  }

  // ------------ Adapter giữ nguyên API cũ cho component ------------
  getOrCreateMyConversation(): Observable<Conversation> {
    return this.openWithAdmin$().pipe(map(s => this.mapConversation(s)));
  }

  listConversations(_q = '', page = 0, size = 20): Observable<Conversation[]> {
    if (this.isAdminContext()) {
      return this.adminSessions$(undefined, page, size).pipe(
        map(p => p.content.map(c => this.mapConversation(c)))
      );
    } else {
      const params = new HttpParams().set('page', page).set('size', size);
      return this.http
        .get<PageResp<ServerConversation>>(`${this.clientApi}/sessions`, { params })
        .pipe(map(p => p.content.map(c => this.mapConversation(c))));
    }
  }

  loadMessages(conversationId: number, page = 0, size = 50): Observable<ChatMessage[]> {
    const src$ = this.isAdminContext()
      ? this.adminMessages$(conversationId, page, size)
      : this.clientMessages$(conversationId, page, size);
    return src$.pipe(map(p => p.content.map(m => this.mapMessage(m))));
  }

  sendMessage(conversationId: number, text: string): Observable<ChatMessage> {
    return this.clientSend$(conversationId, text).pipe(map(m => this.mapMessage(m)));
  }

  // thêm để fix lỗi TS2339
  markRead(conversationId: number): Observable<void> {
    return this.clientMarkRead$(conversationId).pipe(map(() => void 0));
  }
  adminMarkRead(conversationId: number): Observable<void> {
    return this.adminMarkRead$(conversationId).pipe(map(() => void 0));
  }

  onConversationRealtime(conversationId: number, onMessage: (m: ChatMessage) => void) {
    const channel = `chat-${conversationId}`;
    this.pusher.subscribe(channel, {
      'message.new': (payload: ServerMessage) => onMessage(this.mapMessage(payload))
    });
  }
  offConversationRealtime(conversationId: number) {
    this.pusher.unsubscribe(`chat-${conversationId}`);
  }

  // (tuỳ chọn) realtime tổng cho admin
  onAdminRealtime(onNewConv?: (c: Conversation) => void) {
    // Nếu BE có kênh tổng, bật map ở đây.
    // this.pusher.subscribe('chat-admin', { 'session.new': (s: ServerConversation) => onNewConv?.(this.mapConversation(s)) });
  }
  offAdminRealtime() {
    this.pusher.unsubscribe('chat-admin');
  }

  // (tuỳ chọn) nếu cần cho màn admin gửi
  adminSend(conversationId: number, text: string): Observable<ChatMessage> {
    return this.adminSend$(conversationId, text).pipe(map(m => this.mapMessage(m)));
  }
}
