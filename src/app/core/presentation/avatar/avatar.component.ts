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

    @Output() logout = new EventEmitter();
    @Output() profile = new EventEmitter();

    onLogout() {
        this.logout.emit();
    }

    onProfile() {
        this.profile.emit();
    }
}
