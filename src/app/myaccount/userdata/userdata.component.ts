import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../auth/services/user.service';
import { AlertService } from '../../auth/services/alert.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserData } from '../../models/userdata.model';

@Component({
    selector: 'app-userdata',
    templateUrl: './userdata.component.html'
})
export class UserdataComponent implements OnInit {
    myaccountForm: FormGroup;
    currentUser: any;
    loading = false;
    currentUserdata: any;
    index: any;

    constructor(
        private userService: UserService,
        private alertService: AlertService,
        private authService: AuthService,
        private router: Router,
        private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        const index = this.activeRoute.snapshot.params['index'];
        this.index = index;
        this.currentUserdata = this.currentUser.userdata[index];

        this.myaccountForm = new FormGroup({
            firstName: new FormControl(null),
            lastName: new FormControl(null),
            institute: new FormControl(null),
            department: new FormControl(null),
            street: new FormControl(null),
            city: new FormControl(null),
            contact: new FormControl(null),
            phone: new FormControl(null),
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ])
        });
    }

    getInstitutionName() {
        const institution = this.currentUser.institution;
        let name = institution.name1;
        if (institution.name2) {
            name = name + ', ' + institution.name2;
        }

        return name;
    }

    saveUserData() {
        this.loading = true;

        const userData = new UserData(
            this.myaccountForm.value.department,
            this.myaccountForm.value.contact,
            this.myaccountForm.value.phone,
            this.myaccountForm.value.email
        );

        if (this.currentUserdata) {
            // update the current userdata
            this.userService.updateUserData(this.currentUserdata._id, userData)
                .subscribe((data: any) => {
                    const cu: string | null = localStorage.getItem('currentUser');
                    let localUser: any = {};
                    if (cu) {
                        localUser = JSON.parse(cu);
                    }
                    const updatedUserdata = data['obj'];
                    localUser.userdata[this.index] = updatedUserdata;
                    localStorage.setItem('currentUser', JSON.stringify(localUser));
                    this.authService.setCurrentUser(localUser);
                    this.router.navigate(['myaccount']).catch(() => {
                        throw new Error('Unable to navigate');
                    });
                }, (err: HttpErrorResponse) => {
                    const errObj = JSON.parse(err.error);
                    this.alertService.error(errObj.title, true);
                    this.loading = false;
                });
        } else {
            // add new userdata
            this.userService.addUserData(this.currentUser, userData)
                .subscribe((data: any) => {
                    const cu: string | null = localStorage.getItem('currentUser');
                    let localStorageUser: any = {};
                    if (cu) {
                        localStorageUser = JSON.parse(cu);
                    }
                    const updatedUser = data['obj'];
                    localStorageUser.userdata = updatedUser.userdata;
                    localStorage.setItem('currentUser', JSON.stringify(localStorageUser));
                    this.authService.setCurrentUser(data['obj']);
                    this.router.navigate(['myaccount']).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                }, (err: HttpErrorResponse) => {
                    const errObj = JSON.parse(err.error);
                    this.alertService.error(errObj.title, true);
                    this.loading = false;
                });
        }

        this.myaccountForm.reset();
    }

}
