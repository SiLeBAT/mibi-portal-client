import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Institution } from '../../../user/model/institution.model';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../../core/services/alert.service';
import { User } from '../../../user/model/user.model';
import { IRegistrationDetails } from '../../presentation/register/register.component';

export interface IHash {
    [details: string]: string;
}

@Component({
    selector: 'mibi-register-container',
    template: `<mibi-register (register)="register($event)" [institutions]="institutions"></mibi-register>`
})
export class RegisterContainerComponent implements OnInit {
    institutions: Institution[] = [];
    instituteHash: IHash = {};

    constructor(
        private userService: UserService,
        private alertService: AlertService,
        private router: Router) {
    }

    ngOnInit() {
        this.loadInstitutions();
    }

    // TODO: User can be removed & institution resolution should happen on the server
    register(details: IRegistrationDetails) {
        const user = new User(
            details.email,
            details.firstName,
            details.lastName
        );

        user.institution = this.instituteHash[details.instituteName];
        if (!user.institution) {
            user.institution = details.instituteName;
        }

        this.userService.create({
            email: details.email,
            password: details.password
        }, {
            firstName: details.firstName,
            lastName: details.lastName,
            institution: user.institution,
            userData: []
        }).subscribe((data: any) => {
            this.alertService.success(data['title'], true);
            this.router.navigate(['users/login']).catch(() => {
                throw new Error('Unable to navigate.');
            });
        }, (err: HttpErrorResponse) => {
            this.alertService.error(err.error.title, false);
        });

    }

    private loadInstitutions() {
        this.userService.getAllInstitutions()
            .subscribe((data) => {
                for (const entry of data as Array<any>) {
                    const institution = new Institution(entry);
                    this.institutions.push(institution);
                    this.instituteHash[institution.toString()] = institution._id;
                }
            }, (err: HttpErrorResponse) => {
                try {
                    const errObj = JSON.parse(err.error);
                    this.alertService.error(errObj.title);
                } catch (e) { }
            });
    }
}
