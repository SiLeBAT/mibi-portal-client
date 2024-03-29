import { Component, OnInit, OnDestroy } from '@angular/core';
import { fromDTOToInstitution, Institution, InstitutionDTO } from '../../../user/model/institution.model';
import { Store, select } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { RegistrationDetails, UserRegistrationRequest } from '../../model/user.model';
import { takeWhile, map, filter } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';
import { selectUserInstitutions } from '../../state/user.selectors';
import { selectSupportContact } from '../../../content/state/content.selectors';
import { updateIsBusySOA, showCustomBannerSOA } from '../../../core/state/core.actions';
import { ContentMainSlice } from '../../../content/content.state';
import { UserMainSlice } from '../../user.state';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { Observable } from 'rxjs';
import { UserLinkProviderService } from '../../link-provider.service';

@Component({
    selector: 'mibi-register-container',
    template: `<mibi-register *ngIf="(institutions$ | async) as institutions"
        (register)="register($event)"
        [institutions]="institutions"
        [supportContact]="supportContact">
        </mibi-register>`
})
export class RegisterContainerComponent implements OnInit, OnDestroy {

    institutions$: Observable<Institution[]>;
    supportContact: string = '';
    private componentActive: boolean = true;
    constructor(
        private store$: Store<ContentMainSlice & UserMainSlice>,
        private dataService: DataService,
        private userActionService: UserActionService,
        private userLinks: UserLinkProviderService
    ) { }

    ngOnInit() {
        this.loadInstitutions();
        this.store$.pipe(select(selectSupportContact),
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
        this.store$.dispatch(updateIsBusySOA({ isBusy: true }));
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
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(navigateMSA({ path: this.userLinks.login }));
                this.store$.dispatch(showCustomBannerSOA({
                    banner: {
                        message: `Bitte bestätigen Sie Ihre E-Mail-Adresse: Eine E-mail mit weiteren Anweisungen wurde an ${response.email} gesendet`,
                        type: AlertType.SUCCESS,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }));
            }
        ).catch(
            () => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(showCustomBannerSOA({
                    banner: {
                        message: `Fehler beim Registrieren. Eine E-mail mit weiteren Informationen wurde an ${details.email} gesendet. Wenn Sie keine E-mail erhalten, wenden Sie sich bitte direkt per E-mail an uns: ${this.supportContact}.`,
                        type: AlertType.ERROR,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }));
            }
        );
    }

    private loadInstitutions() {
        this.institutions$ = this.store$.pipe(
            select(selectUserInstitutions),
            filter((value) => value.length > 0),
            map((data: InstitutionDTO[]) => data.map(institution => fromDTOToInstitution(institution))
                .sort((a: Institution, b: Institution) => a.getFullName().localeCompare(b.getFullName()))));
    }
}
