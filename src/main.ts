import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import AOS from 'aos';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  AOS.init({
    duration: 700,
  once: true,
  offset: 120,
  easing: 'ease-out',
  });
