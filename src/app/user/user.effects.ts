import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import { map, catchError, exhaustMap, mergeMap, concatAll, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { Router } from '@angular/router';
import { TokenizedUser } from './model/user.model';
import { ShowBannerSOA, UpdateIsBusySOA, DestroyBannerSOA } from '../core/state/core.actions';
import { DelayLoginError, AuthorizationError } from '../core/model/client-error';
import { LogService } from '../core/services/log.service';
import { AlertType } from '../core/model/alert.model';
import { UserActionType } from '../shared/model/user-action.model';
import { UserActionService } from '../core/services/user-action.service';
import { DestroySampleSetSOA } from '../samples/state/samples.actions';
import { Store } from '@ngrx/store';
import { UserMainSlice } from './user.state';
import { UserMainActionTypes, LoginUserSSA, UpdateCurrentUserSOA, DestroyCurrentUserSOA, LogoutUserMSA } from './state/user.actions';

@Injectable()
export class UserMainEffects {

    constructor(private actions$: Actions,
        private dataService: DataService,
        private userActionService: UserActionService,
        private router: Router,
        private logger: LogService,
        private store$: Store<UserMainSlice>) {
    }

    @Effect()
    loginUser$: Observable<DestroyBannerSOA | ShowBannerSOA | UpdateCurrentUserSOA | UpdateIsBusySOA> = this.actions$.pipe(
        ofType<LoginUserSSA>(UserMainActionTypes.LoginUserSSA),
        tap(() => {
            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
        }),
        exhaustMap((action) => this.dataService.login(action.payload).pipe(
            map(
                (user: TokenizedUser) => {
                    this.dataService.setCurrentUser(user);
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new UpdateCurrentUserSOA(user),
                        new DestroyBannerSOA()
                    );
                }),
            concatAll(),
            catchError((error) => {
                this.logger.error('User authentication failed.', error);
                if (error instanceof DelayLoginError) {
                    const waitTime = this.timeConversion(error.timeToWait);
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({
                            predefined: '',
                            custom: {
                                message: `Zu viele fehlgeschlagene Logins, bitte warten Sie ${
                                    waitTime
                                    }.`,
                                type: AlertType.ERROR,
                                mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                            }
                        }));

                } if (error instanceof AuthorizationError) {
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({ predefined: 'loginFailure' })
                    );
                }

                return of(
                    new UpdateIsBusySOA({ isBusy: false }),
                    new ShowBannerSOA({ predefined: 'loginFailure' })
                );
            })
        ))
    );

    @Effect()
    logoutUser$: Observable<DestroyCurrentUserSOA | DestroySampleSetSOA> = this.actions$.pipe(
        ofType<LogoutUserMSA>(UserMainActionTypes.LogoutUserMSA),
        mergeMap(() => {
            this.router.navigate(['users/login']).catch(() => {
                throw new Error('Unable to navigate.');
            });
            this.dataService.logout();
            return of(new DestroyCurrentUserSOA(), new DestroySampleSetSOA());
        })
    );

    private timeConversion(diffToDelay: number): string {
        moment.locale('de');

        const diffDuration = moment.duration(diffToDelay, 'seconds');
        const minutes = ('0' + diffDuration.minutes()).slice(-2);
        const seconds = ('0' + diffDuration.seconds()).slice(-2);

        return `${minutes}:${seconds} Min`;
    }
}
