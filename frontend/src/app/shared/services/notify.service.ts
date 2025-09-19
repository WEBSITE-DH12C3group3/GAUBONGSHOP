import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  async notify(title: string, body: string) {
    if (!this.isBrowser || typeof Notification === 'undefined') return;

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }

  private toast(text: string) {
    const id = 'toast-container';
    let box = document.getElementById(id);
    if (!box) {
      box = document.createElement('div');
      box.id = id;
      box.style.position = 'fixed';
      box.style.right = '16px';
      box.style.bottom = '16px';
      box.style.display = 'grid';
      box.style.gap = '8px';
      document.body.appendChild(box);
    }
    const item = document.createElement('div');
    item.textContent = text;
    item.style.background = '#111827';
    item.style.color = 'white';
    item.style.padding = '10px 12px';
    item.style.borderRadius = '12px';
    item.style.boxShadow = '0 8px 24px rgba(0,0,0,.18)';
    box.appendChild(item);
    setTimeout(() => item.remove(), 3500);
  }
}
