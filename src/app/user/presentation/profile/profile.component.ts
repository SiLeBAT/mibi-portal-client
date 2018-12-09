import { Component, Output, EventEmitter, Input } from '@angular/core';
import { User } from '../../../user/model/user.model';

@Component({
    selector: 'mibi-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

    @Output() logout = new EventEmitter();
    @Input() currentUser: User;
    @Input() institution: string;

    constructor() { }

    onLogout() {
        this.logout.emit();
    }
}
