import { Component, OnInit, OnDestroy } from '@angular/core';
import { fromDTOToInstitution, Institution, InstitutionDTO } from '../../../user/model/institution.model';
import { Store, select } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { RegistrationDetails, UserRegistrationRequest } from '../../model/user.model';
import { Observable } from 'rxjs/internal/Observable';
import { takeWhile, map, filter } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';
import { selectInstitutions } from '../../state/user.reducer';
import { selectSupportContact, ContentMainStates } from '../../../content/state/content.reducer';
import { DisplayBanner } from '../../../core/state/core.actions';
import { ContentSlice } from '../../../content/content.state';

@Component({
    selector: 'mibi-register-container',
    template:   `<div *ngIf="(institutions$ | async) as institutions">
                    <mibi-register
                    (register)="register($event)"
                    [institutions]="institutions"
                    [supportContact]="supportContact">
                    </mibi-register>
                </div>`
})
export class RegisterContainerComponent implements OnInit, OnDestroy {

    institutions$: Observable<Institution[]>;
    private supportContact: string = '';
    private componentActive: boolean = true;
    constructor(
        private router: Router,
        private store: Store<ContentSlice<ContentMainStates>>,
        private dataService: DataService, private userActionService: UserActionService) {
    }

    ngOnInit() {
        this.loadInstitutions();
        this.store.pipe(select(selectSupportContact),
            takeWhile(() => this.componentActive)
        ).subscribe(contact => this.supportContact = contact,
            (error) => {
                throw new ClientError(`Can't determine Support contact detail. error=${error}`);
            });
    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    register(details: RegistrationDetails) {

        this.dataService.registrationRequest(
            {
                email: details.email,
                password: details.password,
                firstName: details.firstName,
                lastName: details.lastName,
                instituteId: details.instituteId
            }
        ).toPromise().then(
            (response: UserRegistrationRequest) => {
                this.router.navigate(['users/login']).then(
                    () => {
                        this.store.dispatch(new DisplayBanner({
                            predefined: '',
                            custom: {
                                // tslint:disable-next-line:max-line-length
                                message: `Bitte aktivieren Sie Ihren Account: Eine E-mail mit weiteren Anweisungen wurde an ${response.email} gesendet`,
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
            () => {
                this.store.dispatch(new DisplayBanner({
                    predefined: '',
                    custom: {
                        // tslint:disable-next-line: max-line-length
                        message: `Fehler beim Registrieren. Eine E-mail mit weiteren Informationen wurde an ${details.email} gesendet. Wenn Sie keine E-mail erhalten, wenden Sie sich bitte direkt per E-mail an uns: ${this.supportContact}.`,
                        type: AlertType.ERROR,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }));
            }
        );
    }

    private loadInstitutions() {
        this.institutions$ = this.store.pipe(
            select(selectInstitutions),
            filter((value) => value.length > 0),
            map((data: InstitutionDTO[]) => {
                return data.map(institution => {
                    return fromDTOToInstitution(institution);
                });
            }));
    }
}
