import { Component, OnInit } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { Project } from '../../shared/interfaces/project.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {

  constructor(private data: DataService) {}
  projects: Project[] = [];
  
  ngOnInit(){
    this.projects = this.data.getProjects();
    //this.skills = this.data.getSkills();
  }
}
