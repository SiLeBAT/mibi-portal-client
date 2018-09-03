import { Component, Output, EventEmitter, Input } from '@angular/core';
import { IUser } from '../../../user/model/models';

@Component({
    selector: 'mibi-profile',
    templateUrl: './profile.component.html'
})
export class ProfileComponent {

    @Output() logout = new EventEmitter();
    @Input() currentUser: IUser;
    @Input() institution: string;

    constructor() { }

    onLogout() {
        this.logout.emit();
    }
}
