import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';

@Component({
    selector: 'app-revovery',
    templateUrl: './recovery.component.html'
})
export class RecoveryComponent implements OnInit {
    recoveryForm: FormGroup;
    loading = false;

    constructor(
        private userService: UserService,
        private alertService: AlertService,
        private router: Router) { }

    ngOnInit() {
        this.recoveryForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ])
        });
    }

    recovery() {

        this.loading = true;

        const email = this.recoveryForm.value.email;

        this.userService.recoveryPassword(email)
            .subscribe((data: any) => {
                const message = data['title'];
                this.alertService.success(message, true);
                this.router.navigate(['users/login']).catch(() => {
                    throw new Error('Unable to navigate.');
                });
            }, (err: HttpErrorResponse) => {
                const errObj = JSON.parse(err.error);
                this.alertService.error(errObj.title, false);
                this.loading = false;
            });

        this.recoveryForm.reset();
    }

}
