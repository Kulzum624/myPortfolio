import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Education } from '../../shared/interfaces/education.interface';
import { DataService } from '../../shared/services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-education',
  imports: [CommonModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent implements OnInit, AfterViewInit, OnDestroy {
  educationList: Education[] = [];
  private observer: IntersectionObserver | null = null;

  constructor(
    private data: DataService,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.educationList = this.data.getEducation();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      // ── Custom IntersectionObserver for ultra-smooth 3D entrance animations ──
      const options = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class to trigger CSS animations
            entry.target.classList.add('visible');
            // Unobserve once animated to save cycles
            this.observer?.unobserve(entry.target);
          }
        });
      }, options);

      const cards = this.elementRef.nativeElement.querySelectorAll('.edu-card-wrapper');
      cards.forEach((card: Element) => {
        this.observer?.observe(card);
      });
    });
  }

  trackById(index: number, item: Education) {
    return item.id;
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
