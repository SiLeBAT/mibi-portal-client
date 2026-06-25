import { Component, Output, EventEmitter, Input } from '@angular/core';
import { User } from '../../../user/model/user.model';
import { userConsentProfileStrings } from '../../user-consent.constants';

@Component({
    standalone: false,
    selector: 'mibi-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

    @Output() logout = new EventEmitter();
    @Input() currentUser!: User;
    @Input() institution = '';

    readonly consentStrings = userConsentProfileStrings;

    onLogout() {
        this.logout.emit();
    }
}
