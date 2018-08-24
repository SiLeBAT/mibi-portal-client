import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { SampleStore } from '../../sampleManagement/services/sampleStore.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    private onLoginSpinner = 'loginSpinner';

    constructor(
        private router: Router,
        private authService: AuthService,
        private alertService: AlertService,
        private spinnerService: LoadingSpinnerService,
        private sampleStore: SampleStore) { }

    ngOnInit() {

        this.loginForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ]),
            password: new FormControl(null, Validators.required)
        });
    }

    isLoginSpinnerShowing() {
        return this.spinnerService.isShowing(this.onLoginSpinner);
    }

    login() {
        this.loading = true;

        const credentials = {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        };

        this.spinnerService.show(this.onLoginSpinner);

        this.authService.login(credentials)
            .subscribe((data: any) => {
                this.spinnerService.hide(this.onLoginSpinner);
                this.loginForm.reset();
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
                this.loginForm.reset();
                const errObj = JSON.parse(err.error);
                const message = errObj.title + ': ' + errObj.error.message;
                this.alertService.error(message);
                this.loading = false;
            });
    }

    private navigationSelection() {
        // get return url from route parameters or default to '/'
        let returnUrl = '/main';

        if (this.sampleStore.hasEntries) {
            returnUrl = '/samples';
        }

        this.router.navigate([returnUrl]).catch(() => {
            throw new Error();
        });
    }

}
