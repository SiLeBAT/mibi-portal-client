import { Component, OnInit } from '@angular/core';
import { Institution } from '../../../user/model/institution.model';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { User } from '../../../user/model/user.model';
import { IRegistrationDetails } from '../../presentation/register/register.component';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';

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
        private router: Router,
        private store: Store<fromUser.IState>,
        private dataService: DataService) {
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

        const credentials = {
            email: details.email,
            password: details.password
        };

        const userDetails = {
            firstName: details.firstName,
            lastName: details.lastName,
            institution: user.institution,
            userData: []
        };

        this.dataService.registerUser(
            credentials,
            userDetails
        ).toPromise().then(
            (response) => {
                this.router.navigate(['users/login']).then(
                    () => {
                        this.store.dispatch(new coreActions.DisplayAlert({
                            // tslint:disable-next-line:max-line-length
                            message: `Bitte aktivieren Sie Ihren Account: Eine Email mit weiteren Anweisungen wurde an ${user.email} gesendet`,
                            type: AlertType.SUCCESS
                        }));
                    }
                ).catch(() => {
                    throw new Error('Unable to navigate.');
                });

            }
        ).catch(
            (response) => {
                this.store.dispatch(new coreActions.DisplayAlert({
                    message: response.title,
                    type: AlertType.ERROR
                }));
            }
        );
    }

    private loadInstitutions() {
        this.dataService.getAllInstitutions().toPromise().then(
            data => {
                for (const entry of data as Array<any>) {
                    const institution = new Institution(entry);
                    this.institutions.push(institution);
                    this.instituteHash[institution.toString()] = institution._id;
                }
            }
        ).catch(
            () => { throw new Error(); }
        );
    }
}
