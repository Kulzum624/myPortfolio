import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AosService } from './shared/services/aos.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'myPortfolio';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private aos: AosService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.aos.init();
    }

    this.titleService.setTitle(
      'Kulzum Mujtaba | Frontend Developer · Angular · TypeScript · Karachi'
    );
  }
}
