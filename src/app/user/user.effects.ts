import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import { map, catchError, concatMap, startWith, endWith } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { Credentials } from './model/user.model';
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA, ShowCustomBannerSOA, CoreMainAction } from '../core/state/core.actions';
import { DelayLoginError } from '../core/model/client-error';
import { LogService } from '../core/services/log.service';
import { AlertType } from '../core/model/alert.model';
import { UserActionType } from '../shared/model/user-action.model';
import { UserActionService } from '../core/services/user-action.service';
import { DestroySampleSetSOA, SamplesMainAction } from '../samples/state/samples.actions';
import { Store } from '@ngrx/store';
import { UserMainSlice } from './user.state';
import { UserMainActionTypes, LoginUserSSA, UpdateCurrentUserSOA, DestroyCurrentUserSOA, LogoutUserMSA, UserMainAction } from './state/user.actions';
import { NavigateAction, NavigateMSA } from '../shared/navigate/navigate.actions';

@Injectable()
export class UserMainEffects {

    constructor(
        private actions$: Actions<UserMainAction>,
        private dataService: DataService,
        private userActionService: UserActionService,
        private logger: LogService
    ) { }

    @Effect()
    loginUser$: Observable<UserMainAction | CoreMainAction> = this.actions$.pipe(
        ofType<LoginUserSSA>(UserMainActionTypes.LoginUserSSA),
        concatMap(action => this.loginUser(action.payload).pipe(
            startWith(
                new UpdateIsBusySOA({ isBusy: true }),
                new HideBannerSOA()
            ),
            endWith(
                new UpdateIsBusySOA({ isBusy: false })
            )
        ))
    );

    @Effect()
    logoutUser$: Observable<UserMainAction | SamplesMainAction | NavigateAction> = this.actions$.pipe(
        ofType<LogoutUserMSA>(UserMainActionTypes.LogoutUserMSA),
        concatMap(() => {
            this.dataService.logout();
            return of(
                new NavigateMSA({ url: 'users/login' }),
                new DestroyCurrentUserSOA(),
                new DestroySampleSetSOA()
            );
        })
    );

    private loginUser(credentials: Credentials): Observable<UserMainAction | CoreMainAction> {
        return this.dataService.login(credentials).pipe(
            map(user => {
                this.dataService.setCurrentUser(user);
                return new UpdateCurrentUserSOA(user);
            }),
            catchError((error: Error) => {
                this.logger.error('User authentication failed.', error.stack);
                if (error instanceof DelayLoginError) {
                    const waitTime = this.timeConversion(error.timeToWait);
                    return of(new ShowCustomBannerSOA({
                        banner: {
                            message: `Zu viele fehlgeschlagene Logins, bitte warten Sie ${waitTime
                                }.`,
                            type: AlertType.ERROR,
                            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                        }
                    }));
                }
                return of(new ShowBannerSOA({ predefined: 'loginFailure' }));
            })
        );
    }

    private timeConversion(diffToDelay: number): string {
        moment.locale('de');

        const diffDuration = moment.duration(diffToDelay, 'seconds');
        const minutes = ('0' + diffDuration.minutes().toString()).slice(-2);
        const seconds = ('0' + diffDuration.seconds().toString()).slice(-2);

        return `${minutes}:${seconds} Min`;
    }
}
