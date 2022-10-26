import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NavBarAvatarUser } from './avatar-user.model';

@Component({
    selector: 'mibi-nav-bar-avatar-view',
    templateUrl: './avatar-view.component.html',
    styleUrls: ['./avatar-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarAvatarViewComponent {

    @Input() user: NavBarAvatarUser;

    @Output() logout = new EventEmitter();
    @Output() profile = new EventEmitter();

    onLogout() {
        this.logout.emit();
    }

    onProfile() {
        this.profile.emit();
    }
}
