import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    if (isPlatformBrowser(this.platformId)) {
      this.loadTheme();
    }
  }

  toggleTheme():void {
    if (isPlatformBrowser(this.platformId)) {
      const current = this.getCurrentTheme();
      const newTheme = current === 'dark'? 'light' : 'dark';
      this.setTheme(newTheme);
    }
  }

  setTheme(theme: 'dark' | 'light'): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  getCurrentTheme(): 'dark' | 'light' {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;

      const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return preferDark ? 'dark' : 'light';
    }
    return 'dark'; // Default for SSR
  }

  private loadTheme(): void {
    const theme = this.getCurrentTheme();
    this.setTheme(theme);
  }
}
