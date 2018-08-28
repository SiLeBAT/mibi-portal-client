import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { UserService } from '../services/user.service';
import { AlertService } from '../../shared/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-activate',
    templateUrl: './activate.component.html'
})
export class ActivateComponent implements OnInit {
    tokenValid: boolean;
    appName: string = environment.appName;

    constructor(private activatedRoute: ActivatedRoute,
        private userService: UserService,
        private alertService: AlertService,
        private router: Router) { }

    ngOnInit() {
        const token = this.activatedRoute.snapshot.params['id'];

        this.userService.activateAccount(token)
            .subscribe((data: any) => {
                const message = data['title'];
                this.alertService.success(message, true);
                this.tokenValid = true;
            }, (err: HttpErrorResponse) => {
                const errObj = JSON.parse(err.error);
                this.alertService.error(errObj.title, false);
                this.tokenValid = false;
            });

    }

    continue() {
        this.router.navigate(['users/login']).catch(() => {
            throw new Error('Unable to navigate.');
        });
    }

}
