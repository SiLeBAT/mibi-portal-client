import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from '../../../user/model/user.model';
import { Observable } from 'rxjs';

export interface INavBarConfiguration {
    appName: string;
}

@Component({
    selector: 'mibi-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {

    @Input() config: INavBarConfiguration;
    @Input() currentUser$: Observable<IUser | null>;
    @Input() hasEntries$: Observable<boolean>;

    @Output() onValidate = new EventEmitter();
    @Output() onSend = new EventEmitter();
    @Output() onExport = new EventEmitter();
    @Output() onLogout = new EventEmitter();

    constructor(
        private router: Router) { }

    validate() {
        this.onValidate.emit();
    }

    export() {
        this.onExport.emit();
    }

    send() {
        this.onSend.emit();
    }

    logout() {
        this.onLogout.emit();
    }

    // TODO: Find a better way to do this.
    getCurrentRoute() {
        return this.router.routerState.snapshot.url;
    }

}
