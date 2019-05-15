import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { DataService } from '../../../core/services/data.service';
import { AlertType } from '../../../core/model/alert.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../../core/services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { PasswordResetRequestResponse } from '../../model/user.model';
import { takeWhile } from 'rxjs/operators';
import { ClientError } from '../../../core/model/client-error';
import { DisplayBanner } from '../../../core/state/core.actions';
import { selectSupportContact, ContentMainStates } from '../../../content/state/content.reducer';

@Component({
    selector: 'mibi-recovery-container',
    template: `<mibi-recovery (recovery)="recovery($event)"></mibi-recovery>`
})
export class RecoveryContainerComponent implements OnInit, OnDestroy {
    private supportContact: string = '';
    private componentActive: boolean = true;

    constructor(private store$: Store<ContentMainStates>,
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
                (response: PasswordResetRequestResponse) => {
                    this.router.navigate(['users/login']).then(
                        () => {
                            this.store$.dispatch(new DisplayBanner({
                                predefined: '',
                                custom: {
                                    // tslint:disable-next-line: max-line-length
                                    message: `Eine Email mit weiteren Anweisungen wurde an ${response.email} gesendet. Wenn Sie keine Email erhalten, könnte das bedeuten, daß Sie sich mit einer anderen Email-Adresse angemeldet haben.`,
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
                    this.store$.dispatch(new DisplayBanner({
                        predefined: '',
                        custom: {
                            // tslint:disable-next-line: max-line-length
                            message: `Fehler beim Passwort zurücksetzen. Eine Email mit weiteren Informationen wurde an ${email} gesendet. Wenn Sie keine Email erhalten, wenden Sie sich bitte direkt per Email an uns: ${this.supportContact}.`,
                            type: AlertType.ERROR,
                            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                        }
                    }));
                }
            );
    }

}
