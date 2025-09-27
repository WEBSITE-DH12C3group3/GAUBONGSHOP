// src/app/shared/services/chat-socket.service.ts
import { Injectable, NgZone } from '@angular/core';
import Pusher, { Channel, Options } from 'pusher-js';
import { environment } from '../../../environments/environment';

type HeadersFn = () => Record<string, string> | undefined;

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private pusher?: Pusher;
  private channels = new Map<string, Channel>();
  private getHeaders?: HeadersFn;

  constructor(private zone: NgZone) {}

  /** Khởi tạo Pusher (idempotent) */
  init(getAuthHeaders?: HeadersFn) {
    if (getAuthHeaders) this.getHeaders = getAuthHeaders;
    if (this.pusher) return this.pusher;

    const opts: Options = {
      cluster: environment.pusher.cluster,
      authEndpoint: environment.pusher.authEndpoint,
      auth: { headers: this.getHeaders ? (this.getHeaders() || {}) : {} },
      enabledTransports: ['ws', 'wss'],
      forceTLS: true
    };

    this.pusher = new Pusher(environment.pusher.key, opts);
    this.pusher.signin?.();
    return this.pusher;
  }

  /** Cập nhật Authorization header khi token đổi mà không cần reconnect */
  refreshAuthHeaders() {
    if (!this.pusher || !this.getHeaders) return;
    const p: any = this.pusher;
    const currentAuth = (p.config?.auth ?? {}) as Record<string, any>;
    p.config = { ...(p.config || {}), auth: { ...currentAuth, headers: this.getHeaders() || {} } };
    try { this.pusher.signin?.(); } catch {}
  }

  /** Helper: đảm bảo đã init và trả về instance Pusher */
  private ensure(): Pusher {
    if (!this.pusher) throw new Error('Pusher not initialized. Call init() first.');
    return this.pusher;
  }

  /** Subscribe kênh (idempotent) */
  sub(channelName: string): Channel {
    const p = this.ensure();                // <-- narrow về Pusher chắc chắn
    const existed = this.channels.get(channelName);
    if (existed) return existed;

    const ch = p.subscribe(channelName);    // <-- không còn lỗi dòng 59
    this.channels.set(channelName, ch);

    ch.bind('pusher:subscription_error', (status: any) => {
      // console.error('[pusher] subscription_error', channelName, status);
    });
    return ch;
  }

  /** Gỡ đăng ký khỏi 1 kênh */
  unsub(channelName: string) {
    if (!this.pusher) return;
    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  /**
   * Bind event & đảm bảo callback chạy trong Angular zone để OnPush cập nhật UI
   * Trả về hàm unbind.
   */
  bind<T = any>(channel: Channel, eventName: string, cb: (data: T) => void): () => void {
    const handler = (payload: T) => this.zone.run(() => cb(payload));
    channel.bind(eventName, handler);
    return () => channel.unbind(eventName, handler);
  }

  /** Huỷ tất cả kênh (khi logout) */
  reset() {
    if (!this.pusher) return;
    for (const name of this.channels.keys()) this.pusher.unsubscribe(name);
    this.channels.clear();
  }

  /** Ngắt kết nối hoàn toàn */
  disconnect() {
    try {
      this.reset();
      this.pusher?.disconnect();
    } finally {
      this.pusher = undefined;
    }
  }
}
