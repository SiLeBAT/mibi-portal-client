import { Component, Input } from '@angular/core';
import { UserActionViewModelConfiguration } from '../../../shared/model/user-action.model';

@Component({
    selector: 'mibi-app-bar-top',
    templateUrl: './app-bar-top.component.html',
    styleUrls: ['./app-bar-top.component.scss']
})
export class AppBarTopComponent {
    @Input() actionBarEnabled: boolean;
    @Input() actionBarTitle: string;
    @Input() actionConfigs: UserActionViewModelConfiguration[];
}
