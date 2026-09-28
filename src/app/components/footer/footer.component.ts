import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SocialButtonsComponent } from '../social-buttons/social-buttons.component';
import { ActionsButtonsComponent } from '../actions-buttons/actions-buttons.component';

@Component({
    selector: 'app-footer',
    imports: [SocialButtonsComponent, ActionsButtonsComponent],
    templateUrl: './footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
