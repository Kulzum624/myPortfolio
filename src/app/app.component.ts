import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AosService } from './shared/services/aos.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'my-portfolio';
  constructor(private aos: AosService){

  }

  ngOninit(){
    this.aos.init();
  }

}
