import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionFavoriteService {
  private sessionKey = 'session_favorites';

  private hasLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  getSessionFavorites(): number[] {
    if (!this.hasLocalStorage()) return [];
    const favs = localStorage.getItem(this.sessionKey);
    return favs ? JSON.parse(favs) : [];
  }

  clearSessionFavorites(): void {
    if (this.hasLocalStorage()) {
      localStorage.removeItem(this.sessionKey);
    }
  }

  addSessionFavorite(productId: number): void {
    if (!this.hasLocalStorage()) return;
    let favs = this.getSessionFavorites();
    if (!favs.includes(productId)) {
      favs.push(productId);
      localStorage.setItem(this.sessionKey, JSON.stringify(favs));
    }
  }

  removeSessionFavorite(productId: number): void {
    if (!this.hasLocalStorage()) return;
    let favs = this.getSessionFavorites().filter(id => id !== productId);
    localStorage.setItem(this.sessionKey, JSON.stringify(favs));
  }
}
