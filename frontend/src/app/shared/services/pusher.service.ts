// src/app/shared/services/pusher.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Pusher, { Channel } from 'pusher-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PusherService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private pusher?: Pusher;
  private channels = new Map<string, Channel>();
  private memoryToken: string | null = null; // giữ token trong bộ nhớ để tránh đọc localStorage khi SSR

  /** Lấy token (ưu tiên token trong bộ nhớ, fallback localStorage khi chạy browser) */
  private getToken(): string | null {
    if (!this.isBrowser) return null;
    if (this.memoryToken) return this.memoryToken;

    let t =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('jwt') ||
      null;

    if (t && !/^Bearer\s/i.test(t)) t = `Bearer ${t}`;
    return t;
  }

  /** Cho phép app chủ động set token sau login/logout (tránh đụng localStorage) */
  setToken(token: string | null) {
    this.memoryToken = token ? (/^Bearer\s/i.test(token) ? token : `Bearer ${token}`) : null;

    // Cách an toàn nhất là ngắt kết nối để tạo lại instance với header mới.
    // (pusher-js không refresh auth headers cho kênh private đã subscribe)
    this.reconnect();
  }

  /** Tạo (hoặc lấy) instance Pusher – lazy, chỉ chạy ở browser */
  private instance(): Pusher | undefined {
    if (!this.isBrowser) return undefined;
    if (this.pusher) return this.pusher;

    const headers = this.getToken() ? { Authorization: this.getToken() as string } : {};

    this.pusher = new Pusher(environment.pusherKey, {
      cluster: environment.pusherCluster,
      forceTLS: true,
      // Nếu backend là http://localhost:8080 => vẫn để forceTLS true (pusher ws qua TLS), auth là call HTTP tới server bạn.
      authEndpoint: `${environment.apiUrl}/api/pusher/auth`,
      auth: { headers },
      // Bật log khi cần debug
      // logToConsole: !!environment.pusherDebug,
      enabledTransports: ['ws', 'wss'], // ưu tiên WebSocket
    });

    // Debug connection state (tùy chọn)
    if ((environment as any).pusherDebug) {
      this.pusher.connection.bind('state_change', (states: any) => {
        // eslint-disable-next-line no-console
        console.log('[Pusher] state:', states?.previous, '->', states?.current);
      });
      this.pusher.connection.bind('error', (err: any) => {
        // eslint-disable-next-line no-console
        console.warn('[Pusher] error:', err);
      });
    }

    return this.pusher;
  }

  /** Subscribe vào kênh (ví dụ: `private-chat.123`) */
  subscribe(channelName: string): Channel | undefined {
    const p = this.instance();
    if (!p) return undefined;

    // Reuse nếu đã có
    const cached = this.channels.get(channelName);
    if (cached) return cached;

    const ch = p.subscribe(channelName);
    this.channels.set(channelName, ch);
    return ch;
  }

  /** Unsubscribe 1 kênh */
  unsubscribe(channelName: string) {
    const p = this.instance();
    if (!p) return;
    try {
      p.unsubscribe(channelName);
    } finally {
      this.channels.delete(channelName);
    }
  }

  /** Unsubscribe tất cả kênh đang mở */
  unsubscribeAll() {
    const p = this.instance();
    if (!p) return;
    for (const name of this.channels.keys()) {
      try {
        p.unsubscribe(name);
      } catch {}
    }
    this.channels.clear();
  }

  /** Ngắt kết nối & xoá instance (dùng khi đổi token, logout, v.v.) */
  teardown() {
    if (!this.pusher) return;
    try {
      this.unsubscribeAll();
      this.pusher.disconnect();
    } finally {
      this.pusher = undefined;
    }
  }

  /** Ngắt rồi khởi tạo lại – caller nên subscribe lại kênh cần thiết */
  reconnect() {
    this.teardown();
    // Tạo lại instance ngay (sẽ dùng headers mới). Subscribe để nơi gọi chủ động thực hiện.
    this.instance();
  }

  // ===== Helpers tiện dụng (tuỳ chọn) =====

  /** Subscribe kênh phiên chat: `private-chat.{sessionId}` */
  subscribeSession(sessionId: number): Channel | undefined {
    return this.subscribe(`private-chat.${sessionId}`);
  }

  /** Bind sự kiện trên kênh (giải phóng ở nơi gọi bằng ch.unbind hoặc unsubscribe) */
  bind(channel: Channel | undefined, eventName: string, cb: (data: any) => void) {
    channel?.bind(eventName, cb);
  }

  unbind(channel: Channel | undefined, eventName: string, cb?: (data: any) => void) {
    channel?.unbind(eventName, cb as any);
  }
}
