import { Injectable } from '@angular/core';
import AOS from 'aos';

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
