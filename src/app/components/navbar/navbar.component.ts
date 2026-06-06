import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../shared/services/clock.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  constructor(private clock: ClockService, private theme: ThemeService){

  }

  currentTime = '';
  isDark = false;

  ngOnInit(): void{
    this.clock.timeObservable.subscribe((time)=>(this.currentTime = time));
    
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
  }

  toggleTheme(event: any) {
    this.isDark = event.target.checked;
    if (this.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  scrollTo(section: string){
    document.getElementById(section)?.scrollIntoView({behavior: 'smooth'});
  }
}
