import { Injectable } from '@angular/core';
import AOS from 'aos';
import 'aos/dist/aos.css';

@Injectable({
  providedIn: 'root'
})
export class AosService {
  init(): void {
    AOS.init({duration: 800, once: true, easing: 'ease-in-out',});
  }

  refresh(){
    AOS.refresh();
  }
}
