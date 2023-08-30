import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import moment from 'moment';
import { map, catchError, concatMap, startWith, endWith, withLatestFrom } from 'rxjs/operators';
import { of, Observable, iif } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { Credentials } from './model/user.model';
import { showBannerSOA, updateIsBusySOA, hideBannerSOA, showCustomBannerSOA } from '../core/state/core.actions';
import { DelayLoginError } from '../core/model/client-error';
import { LogService } from '../core/services/log.service';
import { AlertType } from '../core/model/alert.model';
import { UserActionType } from '../shared/model/user-action.model';
import { UserActionService } from '../core/services/user-action.service';
import { samplesDestroyMainDataSOA } from '../samples/state/samples.actions';
import { Action, Store } from '@ngrx/store';
import {
    userLoginSSA,
    userUpdateCurrentUserSOA,
    userDestroyCurrentUserSOA,
    userLogoutMSA,
    userForceLogoutMSA
} from './state/user.actions';
import { DialogConfiguration } from '../shared/dialog/dialog.model';
import { userLogoutConfirmDialogStrings } from './user.constants';
import { SamplesMainSlice } from '../samples/samples.state';
import { selectHasEntries } from '../samples/state/samples.selectors';
import { dialogConfirmMTA, dialogOpenMTA } from '../shared/dialog/state/dialog.actions';
import { navigateMSA } from '../shared/navigate/navigate.actions';
import { ofTarget } from '../shared/ngrx/multi-target-action';

@Injectable()
export class UserMainEffects {

    private readonly LOGOUT_CONFIRM_DIALOG_TARGET = 'User/LogoutConfirm';

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private userActionService: UserActionService,
        private logger: LogService
    ) { }

    login$ = createEffect(() => this.actions$.pipe(
        ofType(userLoginSSA),
        concatMap(action => this.login(action.credentials).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                showCustomBannerSOA({
                    banner: {
                        message: `Zu Ihrer Information: Ab sofort erhalten sie die E-Mail mit dem Probenbegleitschein (PDF) von der E-Mail-Adresse 'mibi-portal@bfr.berlin'.`,
                        type: AlertType.WARNING,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                }),
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    logout$ = createEffect(() => this.actions$.pipe(
        ofType(userLogoutMSA),
        withLatestFrom(this.store$.select(selectHasEntries)),
        concatMap(([, hasEntries]) => iif(() => hasEntries,
            of(dialogOpenMTA({
                target: this.LOGOUT_CONFIRM_DIALOG_TARGET,
                configuration: this.createLogoutConfirmDialogConfiguration()
            })),
            this.logout()
        ))
    ));

    logoutConfirm$ = createEffect(() => this.actions$.pipe(
        ofType(dialogConfirmMTA),
        ofTarget(this.LOGOUT_CONFIRM_DIALOG_TARGET),
        concatMap(() => this.logout())
    ));

    userForceLogout$ = createEffect(() => this.actions$.pipe(
        ofType(userForceLogoutMSA),
        concatMap(() => this.logout())
    ));

    private login(credentials: Credentials): Observable<Action> {
        return this.dataService.login(credentials).pipe(
            map(user => {
                this.dataService.setCurrentUser(user);
                return userUpdateCurrentUserSOA({ user: user });
            }),
            catchError((error) => {
                this.logger.error('User authentication failed.', error.stack);
                if (error instanceof DelayLoginError) {
                    const waitTime = this.timeConversion(error.timeToWait);
                    return of(showCustomBannerSOA({
                        banner: {
                            message: `Zu viele fehlgeschlagene Logins, bitte warten Sie ${waitTime}.`,
                            type: AlertType.ERROR,
                            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                        }
                    }));
                }
                return of(showBannerSOA({ predefined: 'loginFailure' }));
            })
        );
    }

    private logout(): Observable<Action> {
        this.dataService.logout();
        return of(
            navigateMSA({ url: 'users/login' }),
            userDestroyCurrentUserSOA(),
            samplesDestroyMainDataSOA()
        );
    }

    // Utility

    private createLogoutConfirmDialogConfiguration(): DialogConfiguration {
        const strings = userLogoutConfirmDialogStrings;
        return {
            title: strings.title,
            message: strings.message,
            confirmButtonConfig: {
                label: strings.confirmButtonLabel
            },
            cancelButtonConfig: {
                label: strings.cancelButtonLabel
            },
            warnings: []
        };
    }

    private timeConversion(diffToDelay: number): string {
        moment.locale('de');

        const diffDuration = moment.duration(diffToDelay, 'seconds');
        const minutes = ('0' + diffDuration.minutes().toString()).slice(-2);
        const seconds = ('0' + diffDuration.seconds().toString()).slice(-2);

        return `${minutes}:${seconds} Min`;
    }
}
