import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { UserService } from '../services/user.service';
import { AlertService } from '../../shared/services/alert.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-admin-activate',
    templateUrl: './admin-activate.component.html'
})
export class AdminActivateComponent implements OnInit {

    adminTokenValid: boolean;
    name: string;
    appName: string = environment.appName;

    constructor(private activatedRoute: ActivatedRoute,
        private userService: UserService,
        private alertService: AlertService) { }

    ngOnInit() {
        const adminToken = this.activatedRoute.snapshot.params['id'];

        this.userService.adminActivateAccount(adminToken)
            .subscribe((data: any) => {
                const message = data['title'];
                this.name = data['obj'];
                this.alertService.success(message, true);
                this.adminTokenValid = true;
            }, (err: HttpErrorResponse) => {
                const errObj = JSON.parse(err.error);
                this.alertService.error(errObj.title, false);
                this.adminTokenValid = false;
            });

    }

}
