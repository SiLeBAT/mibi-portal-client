import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SampleStore } from '../../../sampleManagement/services/sampleStore.service';
import { IUser } from '../../../models/models';
import { AuthService } from '../../../auth/services/auth.service';

// TODO: Fix this mess
export interface INavBarConfiguration {
    appName: string;
    //  currentUser: IUser;
}

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

    @Input() config: INavBarConfiguration;
    @Input() currentUser: IUser;

    @Output() onValidate = new EventEmitter();
    @Output() onSend = new EventEmitter();
    @Output() onExport = new EventEmitter();
    @Output() onLogout = new EventEmitter();

    constructor(
        public authService: AuthService,
        private router: Router,
        public sampleStore: SampleStore) { }

    validate() {
        this.onValidate.emit();
    }

    export() {
        this.onExport.emit();
    }

    async send() {
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
