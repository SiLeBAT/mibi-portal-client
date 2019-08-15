import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { UserPasswordResetRequest } from '../../model/user.model';
import { takeWhile } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';
import { DisplayBannerSOA, UpdateIsBusySOA } from '../../../core/state/core.actions';
import { ContentMainState } from '../../../content/state/content.reducer';
import { selectSupportContact } from '../../../content/state/content.selectors';
import { ContentSlice } from '../../../content/content.state';

@Component({
    selector: 'mibi-recovery-container',
    template: `<mibi-recovery (recovery)="recovery($event)"></mibi-recovery>`
})
export class RecoveryContainerComponent implements OnInit, OnDestroy {
    private supportContact: string = '';
    private componentActive: boolean = true;

    constructor(private store$: Store<ContentSlice<ContentMainState>>,
        private dataService: DataService, private router: Router, private userActionService: UserActionService) { }

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
        this.dataService.resetPasswordRequest(
            email).toPromise().then(
                (response: UserPasswordResetRequest) => {
                    this.router.navigate(['users/login']).then(
                        () => {
                            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                            this.store$.dispatch(new DisplayBannerSOA({
                                predefined: '',
                                custom: {
                                    // tslint:disable-next-line: max-line-length
                                    message: `Eine E-mail mit weiteren Anweisungen wurde an ${response.email} gesendet. Wenn Sie keine E-mail erhalten, könnte das bedeuten, daß Sie sich mit einer anderen E-mail-Adresse angemeldet haben.`,
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
                    this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                    this.store$.dispatch(new DisplayBannerSOA({
                        predefined: '',
                        custom: {
                            // tslint:disable-next-line: max-line-length
                            message: `Fehler beim Passwort-Zurücksetzen. Eine E-mail mit weiteren Informationen wurde an ${email} gesendet. Wenn Sie keine E-mail erhalten, wenden Sie sich bitte direkt per E-mail an uns: ${this.supportContact}.`,
                            type: AlertType.ERROR,
                            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                        }
                    }));
                }
            );
    }

}
