import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../user/services/auth.service';
import { IUser } from '../../../user/model/models';
import { SampleStore } from '../../../samples/services/sample-store.service';

// TODO: Fix this mess
export interface INavBarConfiguration {
    appName: string;
    //  currentUser: IUser;
}

@Component({
    selector: 'mibi-nav-bar',
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
