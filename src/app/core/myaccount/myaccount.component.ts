import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UserService } from '../../auth/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../shared/services/alert.service';

@Component({
    selector: 'app-myaccount',
    templateUrl: './myaccount.component.html',
    styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {
    currentUser: any;

    constructor(private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private alertService: AlertService) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
    }

    addUserData() {
        this.router.navigateByUrl('/userdata').catch(() => {
            throw new Error('Unable to navigate.');
        });
    }

    deleteUserData(userdata: any) {

        this.userService.deleteUserData(userdata._id, this.currentUser._id)
            .subscribe((data: any) => {

                const cu: string | null = localStorage.getItem('currentUser');
                let localUser: any = {};
                if (cu) {
                    localUser = JSON.parse(cu);
                }
                // const updatedUser = data['obj'];
                const updatedUserdata = data['obj'].userdata;
                localUser.userdata = updatedUserdata;
                localStorage.setItem('currentUser', JSON.stringify(localUser));
                this.authService.setCurrentUser(localUser);
                this.currentUser = localUser;
            }, (err: HttpErrorResponse) => {
                const errObj = JSON.parse(err.error);
                this.alertService.error(errObj.title, true);
            });

    }

}
