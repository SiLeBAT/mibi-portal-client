import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../user/model/user.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'mibi-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {

    @Input() currentUser$: Observable<User | null>;
    @Input() hasEntries$: Observable<boolean>;

    @Output() onLogout = new EventEmitter();

    logout() {
        this.onLogout.emit();
    }
}
