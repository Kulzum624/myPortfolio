import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, interval, startWith } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  private currentTime$ = new BehaviorSubject<string>(this.formatTime(new Date()));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    if (isPlatformBrowser(this.platformId)) {
      interval(1000)
      .pipe(
        startWith(0),
        map(()=> this.formatTime(new Date()))
      )
      .subscribe((time)=> this.currentTime$.next(time));
    }
  }

  get timeObservable(){
    return this.currentTime$.asObservable();
  }

  private formatTime(date: Date): string {
    return date.toLocaleDateString([], { hour: '2-digit', minute: '2-digit'})
  }
}
