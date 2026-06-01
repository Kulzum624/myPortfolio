import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AosService } from './shared/services/aos.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'myPortfolio';

  constructor(private aos: AosService) { }

  ngOnInit() {
    this.aos.init();
  }
}
