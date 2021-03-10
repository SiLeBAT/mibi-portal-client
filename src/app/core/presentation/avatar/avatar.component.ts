import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../user/model/user.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'mibi-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {

    @Input() currentUser$: Observable<User | null>;

    @Output() onLogout = new EventEmitter();
    @Output() onLogin = new EventEmitter();
    @Output() onProfile = new EventEmitter();

    logout() {
        this.onLogout.emit();
    }

    login() {
        this.onLogin.emit();
    }

    goToProfile() {
        this.onProfile.emit();
    }
}
