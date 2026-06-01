import { Injectable } from '@angular/core';
import { Project } from '../interfaces/project.interface';
import { Skill } from '../interfaces/skill.interface';
import { Education } from '../interfaces/education.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  getProjects(): Project[] {
    return [
      {
        id: 1,
        title: 'Comfy',
        // description: 'AI-based system to recognize hand gestures for contactless ordering in restaurants.',
        // technologies: ['Python', 'TensorFlow', 'OpenCV'],
        image: 'assets/projectThumbnails/1.png',
        url: "https://comfysharkstack.netlify.app/"
        // github: 'https://github.com/kulzum/gesture-order',
      },
      {
        id: 2,
        title: 'Weather forecast',
        // description: 'ML model that classifies baby cries into categories such as hungry, tired, and discomfort.',
        // technologies: ['Python', 'Librosa', 'Keras'],
        image: 'assets/projectThumbnails/2.png',
        url: "https://weatherforecastsharksolutions.netlify.app/"
      },
      {
        id: 3,
        title: 'Recipes App',
        // description: 'Developed a legal services platform to enhance accessibility, affordability, and transparency in legal consultations.',
        // technologies: ['React', 'Strapi', 'Node.js'],
        image: 'assets/projectThumbnails/3.png',
        url: "https://recipesitesharkstack.netlify.app/"
      },
      {
        id: 4,
        title: 'InWood',
        // description: 'Face mask detection system using computer vision and deep learning.',
        // technologies: ['Python', 'TensorFlow', 'OpenCV'],
        image: 'assets/projectThumbnails/4.png',
        url: "https://inwoodsharkstack.netlify.app/"
      },
      {
        id: 5,
        title: 'Space Travel',
        // description: 'Face mask detection system using computer vision and deep learning.',
        // technologies: ['Python', 'TensorFlow', 'OpenCV'],
        image: 'assets/projectThumbnails/5.png',
        url: "https://spacetravelsharkstack.netlify.app/"
      },
      {
        id: 6,
        title: 'Rock Paper Scissors Game',
        // description: 'Face mask detection system using computer vision and deep learning.',
        // technologies: ['Python', 'TensorFlow', 'OpenCV'],
        image: 'assets/projectThumbnails/6.png',
        url: "https://rockpaperscissorsharksolutions.netlify.app/"
      },

    ];
  }

  getSkills(): Skill[] {
    return [
      { id: 1, name: 'Angular', level: 'Advanced', icon: 'assets/icons/angular.svg' },
      { id: 2, name: 'React', level: 'Advanced', icon: 'assets/icons/react.svg' },
      { id: 3, name: 'Node.js', level: 'Intermediate', icon: 'assets/icons/node.svg' },
      { id: 4, name: 'Python', level: 'Intermediate', icon: 'assets/icons/python.svg' },
      { id: 5, name: 'TensorFlow', level: 'Intermediate', icon: 'assets/icons/tensorflow.svg' },
      { id: 6, name: 'MongoDB', level: 'Intermediate', icon: 'assets/icons/mongodb.svg' },
    ];
  }

  getEducation(): Education[] {
    return [
      {
        id: 1,
        degree: 'BS Computer Science',
        institute: 'National University of Computer and Emerging Sciences (FAST NUCES), Karachi',
        startYear: '2020',
        endYear: '2025',
        description: 'Focused on software development, AI/ML, and data science. Completed projects in web development, computer vision, and deep learning.',
      },
      {
        id: 2,
        degree: 'Intermediate in Pre-Engineering',
        institute: 'IBA Public School Larkana Campus',
        startYear: '2018',
        endYear: '2020',
        description: 'Studied Core Mathematics, Physics, and Chemistry',
      },
      {
        id: 3,
        degree: 'Matriculation',
        institute: 'IBA Community College Khairpur Campus',
        startYear: '2016',
        endYear: '2018',
        description: 'Achieved distinction in mathematics and science subjects.',
      },
    ];
  }
}
