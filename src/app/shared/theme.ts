import { Injectable, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'zyger-tools-theme';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  public readonly mode = signal<ThemeMode>(this.readInitialMode());

  constructor() {
    this.applyToDocument(this.mode());
  }

  /**
   * Alterna entre os temas claro e escuro e persiste a escolha no localStorage.
   */
  public toggle(): void {
    const next: ThemeMode = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(next);
    this.applyToDocument(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private readInitialMode(): ThemeMode {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyToDocument(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
  }
}
