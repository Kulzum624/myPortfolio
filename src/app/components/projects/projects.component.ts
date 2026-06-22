import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { Project } from '../../shared/interfaces/project.interface';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent implements OnInit {

  constructor(private data: DataService) {}
  projects: Project[] = [];
  
  ngOnInit(){
    this.projects = this.data.getProjects();
  }
}

