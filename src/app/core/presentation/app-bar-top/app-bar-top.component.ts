import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../../../user/model/user.model';

@Component({
    selector: 'mibi-app-bar-top',
    templateUrl: './app-bar-top.component.html',
    styleUrls: ['./app-bar-top.component.scss']
})
export class AppBarTopComponent {
    @Input() currentUser$: Observable<IUser | null>;
    @Input() appName: string;
    constructor() { }

}
