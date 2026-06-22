import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ClockService } from '../../shared/services/clock.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  constructor(
    private clock: ClockService, 
    private theme: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  currentTime = '';
  isDark = false;

  ngOnInit(): void{
    this.clock.timeObservable.subscribe((time)=>(this.currentTime = time));
    
    if (isPlatformBrowser(this.platformId)) {
      // Check if theme is 'dark' in localStorage, or default to dark if not set
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === null) {
        this.isDark = true;
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        this.isDark = false;
        document.documentElement.classList.remove('dark');
      }
    } else {
      this.isDark = true; // Default for SSR
    }
  }

  toggleTheme(event: any) {
    this.isDark = event.target.checked;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  scrollTo(section: string){
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(section)?.scrollIntoView({behavior: 'smooth'});
    }
  }
}
