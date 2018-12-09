import { Component, OnInit } from '@angular/core';
import { DefaultInstitution } from '../../../user/model/institution.model';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { DefaultUser } from '../../../user/model/user.model';
import { RegistrationDetails } from '../../presentation/register/register.component';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';

export interface IHash {
    [details: string]: string;
}

@Component({
    selector: 'mibi-register-container',
    template: `<mibi-register (register)="register($event)" [institutions]="institutions"></mibi-register>`
})
export class RegisterContainerComponent implements OnInit {
    institutions: DefaultInstitution[] = [];
    instituteHash: IHash = {};

    constructor(
        private router: Router,
        private store: Store<fromUser.IState>,
        private dataService: DataService, private userActionService: UserActionService) {
    }

    ngOnInit() {
        this.loadInstitutions();
    }

    // TODO: User can be removed & institution resolution should happen on the server
    register(details: RegistrationDetails) {
        const user = new DefaultUser(
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
            () => {
                this.router.navigate(['users/login']).then(
                    () => {
                        this.store.dispatch(new coreActions.DisplayBanner({
                            predefined: '',
                            custom: {
                                // tslint:disable-next-line:max-line-length
                                message: `Bitte aktivieren Sie Ihren Account: Eine Email mit weiteren Anweisungen wurde an ${user.email} gesendet`,
                                type: AlertType.SUCCESS,
                                mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                            }
                        }));
                    }
                ).catch(() => {
                    throw new Error('Unable to navigate.');
                });

            }
        ).catch(
            (response) => {
                this.store.dispatch(new coreActions.DisplayBanner({
                    predefined: '',
                    custom: {
                        message: response.error.title,
                        type: AlertType.ERROR,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }));
            }
        );
    }

    private loadInstitutions() {
        this.dataService.getAllInstitutions().toPromise().then(
            data => {
                for (const entry of data as Array<any>) {
                    const institution = new DefaultInstitution(entry);
                    this.institutions.push(institution);
                    this.instituteHash[institution.toString()] = institution._id;
                }
            }
        ).catch(
            () => { throw new Error(); }
        );
    }
}
