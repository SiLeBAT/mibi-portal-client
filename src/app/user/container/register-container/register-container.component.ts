import { Component, OnInit } from '@angular/core';
import { fromDTOToInstitution, Institution, InstitutionDTO } from '../../../user/model/institution.model';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { Store, select } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { Credentials } from '../../model/user.model';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';

@Component({
    selector: 'mibi-register-container',
    template: `<mibi-register (register)="register($event)" [institutions]="institutions$ | async"></mibi-register>`
})
export class RegisterContainerComponent implements OnInit {
    institutions$: Observable<Institution[]>;

    constructor(
        private router: Router,
        private store: Store<fromUser.State>,
        private dataService: DataService, private userActionService: UserActionService) {
    }

    ngOnInit() {
        this.loadInstitutions();
    }

    register(details: Credentials) {

        this.dataService.registerUser(
            {
                email: details.email,
                password: details.password,
                firstName: details.firstName,
                lastName: details.lastName,
                instituteId: details.instituteId
            }
        ).toPromise().then(
            () => {
                this.router.navigate(['users/login']).then(
                    () => {
                        this.store.dispatch(new coreActions.DisplayBanner({
                            predefined: '',
                            custom: {
                                // tslint:disable-next-line:max-line-length
                                message: `Bitte aktivieren Sie Ihren Account: Eine Email mit weiteren Anweisungen wurde an ${details.email} gesendet`,
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
        this.institutions$ = this.store.pipe(
            select(fromUser.getInstitutions),
            map((data: InstitutionDTO[]) => {
                return data.map(institution => {
                    return fromDTOToInstitution(institution);
                });

            }));
    }
}
