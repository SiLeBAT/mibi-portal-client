import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { UserPasswordResetRequest } from '../../model/user.model';
import { takeWhile } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';
import { updateIsBusySOA, showCustomBannerSOA } from '../../../core/state/core.actions';
import { ContentMainState } from '../../../content/state/content.reducer';
import { selectSupportContact } from '../../../content/state/content.selectors';
import { ContentSlice } from '../../../content/content.state';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';

@Component({
    selector: 'mibi-recovery-container',
    template: `<mibi-recovery (recovery)="recovery($event)"></mibi-recovery>`
})
export class RecoveryContainerComponent implements OnInit, OnDestroy {
    private supportContact: string = '';
    private componentActive: boolean = true;

    constructor(
        private store$: Store<ContentSlice<ContentMainState>>,
        private dataService: DataService,
        private userActionService: UserActionService
    ) { }

    ngOnInit() {
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

    recovery(email: string) {
        this.store$.dispatch(updateIsBusySOA({ isBusy: true }));
        this.dataService.resetPasswordRequest(email).toPromise()
            .then((response: UserPasswordResetRequest) => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(navigateMSA({ url: 'users/login' }));
                this.store$.dispatch(showCustomBannerSOA({
                    banner: {
                        message: `Eine E-mail mit weiteren Anweisungen wurde an ${response.email} gesendet. Wenn Sie keine E-mail erhalten, könnte das bedeuten, daß Sie sich mit einer anderen E-mail-Adresse angemeldet haben.`,
                        type: AlertType.SUCCESS,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }));
            })
            .catch(() => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(showCustomBannerSOA({
                    banner: {
                        message: `Fehler beim Passwort-Zurücksetzen. Eine E-mail mit weiteren Informationen wurde an ${email} gesendet. Wenn Sie keine E-mail erhalten, wenden Sie sich bitte direkt per E-mail an uns: ${this.supportContact}.`,
                        type: AlertType.ERROR,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }));
            });
    }
}
