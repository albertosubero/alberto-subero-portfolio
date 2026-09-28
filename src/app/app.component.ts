import { Component } from '@angular/core';
import { skillI, skills } from './utils/skills';
import { SocialButtonsComponent } from './components/social-buttons/social-buttons.component';
import { ActionsButtonsComponent } from './components/actions-buttons/actions-buttons.component';
import { experienceI, experiences } from './utils/jobs-experiences';
import { CommonModule } from '@angular/common';
import { projectI, projects } from './utils/projects';
import { FooterComponent } from './components/footer/footer.component';
import { SpaceBackgroundComponent } from './components/space-background/space-background.component';
import * as AOS from 'aos';

@Component({
    selector: 'app-root',
    imports: [CommonModule, SocialButtonsComponent, ActionsButtonsComponent, FooterComponent, SpaceBackgroundComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'alberto-subero-portfolio';
  skills: skillI[] = skills;
  experiences: experienceI[] = experiences;
  projects: projectI[] = projects;

  experiencesLimit: number = 2;
  selectedProject: number = 0;
  showProjectDetails: boolean = true;

  ngOnInit() {
    window.scrollTo(0, 0)
    this.preloadProjectImages()
  }

  onPictureLoad(event: Event) {
    const picture = event.target as HTMLImageElement;
    picture.classList.add('is-loaded');
    picture.parentElement?.classList.add('is-loaded');
  }

  // Precarga las imágenes de los proyectos cuando el navegador está libre,
  // para que el cambio entre proyectos sea instantáneo.
  private preloadProjectImages() {
    const preload = () => {
      for (const project of this.projects) {
        for (const source of project.images) {
          new Image().src = source;
        }
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preload);
    } else {
      setTimeout(preload, 2000);
    }
  }

  ngAfterViewInit() {
    document.onreadystatechange = function () {
      if (document.readyState == "complete") {
        AOS.init();
        window.addEventListener('scroll', AOS.refresh);
      } 
    }
  }
}
