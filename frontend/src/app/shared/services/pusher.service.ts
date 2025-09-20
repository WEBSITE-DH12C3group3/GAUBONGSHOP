// src/app/shared/services/pusher.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Pusher, { Channel } from 'pusher-js';
import { environment } from '../../../environments/environment';

type HeaderMap = Partial<Record<string, string>>;

@Injectable({ providedIn: 'root' })
export class PusherService {
  private platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private pusher?: Pusher;
  private channels = new Map<string, Channel>();
  private memoryToken: string | null = null; // giữ token trong bộ nhớ để tránh đụng localStorage khi SSR

  /** Lấy token từ bộ nhớ (ưu tiên) hoặc localStorage (chỉ khi chạy browser) */
  private getTokenFromAnywhere(): string | null {
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

  /** Cho app set token sau login/logout (pusher sẽ reconnect để nhận header mới) */
  setToken(token: string | null): void {
    this.memoryToken = token
      ? /^Bearer\s/i.test(token)
        ? token
        : `Bearer ${token}`
      : null;
    if (this.pusher) this.reconnect();
  }

  /** Build headers cho auth endpoint (luôn trả về Record<string,string>) */
  private buildHeaders(extra?: HeaderMap): Record<string, string> {
    const base: Record<string, string> = {};
    const token = this.getTokenFromAnywhere();
    if (token) base['Authorization'] = token;
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (typeof v === 'string') base[k] = v;
      }
    }
    return base;
  }

  /** Khởi tạo Pusher (lazy). Có thể truyền hàm lấy header bổ sung (nếu cần) */
  init(getExtraHeaders?: () => HeaderMap): void {
    if (!this.isBrowser) return;     // không chạy khi SSR
    if (this.pusher) return;         // tránh init 2 lần

    const headers = this.buildHeaders(getExtraHeaders?.());

    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      authEndpoint: environment.pusher.authEndpoint,
      auth: { headers },
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
    });

    // Debug tuỳ chọn
    if ((environment as any).pusherDebug) {
      this.pusher.connection.bind('state_change', (s: any) =>
        console.log('[Pusher] state:', s?.previous, '->', s?.current)
      );
      this.pusher.connection.bind('error', (e: any) =>
        console.warn('[Pusher] error:', e)
      );
    }
  }

  /** Lấy instance (nếu cần truy cập trực tiếp). Ném lỗi nếu chưa init. */
  get instance(): Pusher {
    if (!this.pusher) throw new Error('Pusher not initialized. Call init() first.');
    return this.pusher;
  }

  /** Subscribe kênh (cache channel để tái sử dụng) */
  subscribe(channelName: string): Channel {
    if (!this.pusher) this.init(); // đảm bảo đã init
    const p = this.instance;

    const cached = this.channels.get(channelName);
    if (cached) return cached;

    const ch = p.subscribe(channelName);
    this.channels.set(channelName, ch);
    return ch;
  }

  /** Unsubscribe 1 kênh */
  unsubscribe(channelName: string): void {
    if (!this.pusher) return;
    try {
      this.pusher.unsubscribe(channelName);
    } finally {
      this.channels.delete(channelName);
    }
  }

  /** Unsubscribe tất cả kênh */
  unsubscribeAll(): void {
    if (!this.pusher) return;
    for (const name of this.channels.keys()) {
      try {
        this.pusher.unsubscribe(name);
      } catch { /* noop */ }
    }
    this.channels.clear();
  }

  /** Ngắt kết nối và xoá instance (dùng khi logout/đổi token) */
  teardown(): void {
    if (!this.pusher) return;
    try {
      this.unsubscribeAll();
      this.pusher.disconnect();
    } finally {
      this.pusher = undefined;
    }
  }

  /** Ngắt rồi khởi tạo lại (không tự subscribe lại các kênh) */
  reconnect(): void {
    this.teardown();
    this.init(); // tạo lại với header mới; nơi gọi chủ động subscribe lại kênh cần thiết
  }

  // ===== Helpers tiện dụng =====
  /** Subscribe kênh phiên chat `private-chat.{sessionId}` */
  subscribeSession(sessionId: number): Channel {
    return this.subscribe(`private-chat.${sessionId}`);
  }

  /** Bind / unbind sự kiện trên kênh */
  bind(channel: Channel, eventName: string, cb: (data: any) => void): void {
    channel?.bind(eventName, cb);
  }
  unbind(channel: Channel, eventName: string, cb?: (data: any) => void): void {
    channel?.unbind(eventName, cb as any);
  }
}
