import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { EducationComponent } from '../../components/education/education.component';
import { ProjectsComponent } from '../../components/projects/projects.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { Skills3dComponent } from '../../components/skills3d/skills3d.component';
import { AboutComponent } from '../../components/about/about.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
@Component({
  selector: 'app-home',
  imports: [NavbarComponent, HeroComponent, AboutComponent, EducationComponent, ProjectsComponent, Skills3dComponent, ExperienceComponent, ContactComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
