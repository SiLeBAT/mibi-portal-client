import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { LoadingSpinnerService } from '../../../core/services/loading-spinner.service';
import { SampleStore } from '../../../samples/services/sample-store.service';
import { ICredentials } from '../../../user/model/models';

@Component({
    selector: 'mibi-login-container',
    template: `<mibi-login
    (login)="login($event)">
    </mibi-login>`
})
export class LoginContainerComponent {

    private onLoginSpinner = 'loginSpinner';

    constructor(
        private router: Router,
        private authService: AuthService,
        private alertService: AlertService,
        private spinnerService: LoadingSpinnerService,
        private sampleStore: SampleStore) { }

    login(credentials: ICredentials) {

        this.spinnerService.show(this.onLoginSpinner);

        this.authService.login(credentials)
            .subscribe((data: any) => {
                this.spinnerService.hide(this.onLoginSpinner);
                if (!data['obj']['token']) {
                    this.alertService.error(data['title']);
                } else {
                    const currentUser = data['obj'];
                    if (currentUser && currentUser.token) {
                        // store user details and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        this.authService.setCurrentUser(currentUser);
                    }
                    this.navigationSelection();
                }
            }, (err: HttpErrorResponse) => {
                this.spinnerService.hide(this.onLoginSpinner);
                const errObj = JSON.parse(err.error);
                const message = errObj.title + ': ' + errObj.error.message;
                this.alertService.error(message);
            });
    }

    private navigationSelection() {
        // get return url from route parameters or default to '/'
        let returnUrl = '/users/profile';

        if (this.sampleStore.hasEntries) {
            returnUrl = '/samples';
        }

        this.router.navigate([returnUrl]).catch(() => {
            throw new Error();
        });
    }

}
