import { Component } from '@angular/core';
import { SocialButtonsComponent } from '../social-buttons/social-buttons.component';
import { ActionsButtonsComponent } from '../actions-buttons/actions-buttons.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SocialButtonsComponent, ActionsButtonsComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
