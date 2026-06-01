import { Component, OnInit } from '@angular/core';
import { Education } from '../../shared/interfaces/education.interface';
import { DataService } from '../../shared/services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-education',
  imports: [CommonModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent implements OnInit{
  educationList: Education[] = [];

  constructor(private data: DataService) {
    
  }

  ngOnInit(){
    this.educationList = this.data.getEducation();
  }
}
