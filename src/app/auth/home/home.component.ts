import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../services/user.service';
import { AlertService } from '../../shared/services/alert.service';
import { AuthService } from '../services/auth.service';
import { IUser } from '../../shared/models/models';
import { User } from '../../shared/models/user.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    currentUser: IUser;
    users: IUser[] = [];

    constructor(private userService: UserService,
        private alertService: AlertService,
        private authService: AuthService) { }

    ngOnInit() {
        // this.loadAllUsers();
        const cu: string | null = localStorage.getItem('currentUser');
        if (cu) {
            this.currentUser = JSON.parse(cu);
        }

    }

    logout() {
        this.authService.logout();
    }

    deleteUser(user: User) {
        const _id = user._id;

        this.userService.delete(_id)
            .subscribe((data) => {
                this.alertService.success('User ' + user.firstName + ' ' + user.lastName + ' deleted', true);
                this.loadAllUsers();
            }, (err: HttpErrorResponse) => {
                try {
                    const errObj = JSON.parse(err.error);
                    this.alertService.error(errObj.title);
                } catch (e) { }

                this.loadAllUsers();
            });

    }

    getInstitutionName() {
        let name = this.currentUser.institution['name1'];
        if (this.currentUser.institution['name2']) {
            name = name + ', ' + this.currentUser.institution['name2'];
        }

        return name;
    }

    private loadAllUsers() {
        this.userService.getAll()
            .subscribe((data: any) => {
                this.alertService.success(data['title']);
                this.users = data['obj'];
            }, (err: HttpErrorResponse) => {
                try {
                    const errObj = JSON.parse(err.error);
                    this.alertService.error(errObj.title);
                } catch (e) { }
            });
    }
}
