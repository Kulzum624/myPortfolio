import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';

  constructor() { 
    this.loadTheme();
  }

  toggleTheme():void {
    const current = this.getCurrentTheme();
    const newTheme = current === 'dark'? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'dark' | 'light'): void {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getCurrentTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;

    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return preferDark ? 'dark' : 'light';
  }

  private loadTheme(): void {
    const theme = this.getCurrentTheme();
    this.setTheme(theme);
  }
}
