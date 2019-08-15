import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import * as userActions from './state/user.actions';
import { map, catchError, exhaustMap, mergeMap, concatAll } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { Router } from '@angular/router';
import { TokenizedUser } from './model/user.model';
import { DisplayBannerSOA, UpdateIsBusySOA, DestroyBannerSOA } from '../core/state/core.actions';
import { DelayLoginError, AuthorizationError } from '../core/model/client-error';
import { LogService } from '../core/services/log.service';
import { AlertType } from '../core/model/alert.model';
import { UserActionType } from '../shared/model/user-action.model';
import { UserActionService } from '../core/services/user-action.service';
import { DestroySampleSetSOA } from '../samples/state/samples.actions';

@Injectable()
export class UserMainEffects {

    constructor(private actions$: Actions,
        private dataService: DataService,
        private userActionService: UserActionService,
        private router: Router,
        private logger: LogService) {
    }

    @Effect()
    loginUser$ = this.actions$.pipe(
        ofType(userActions.UserMainActionTypes.LoginUserSSA),
        exhaustMap((action: userActions.LoginUserSSA) => this.dataService.login(action.payload).pipe(
            map(
                (user: TokenizedUser) => {
                    this.dataService.setCurrentUser(user);
                    return of(new userActions.UpdateCurrentUserSOA(user), new DestroyBannerSOA(), new UpdateIsBusySOA({ isBusy: false }));
                }),
            concatAll(),
            catchError((error) => {
                this.logger.error('User authentication failed.', error);
                if (error instanceof DelayLoginError) {
                    const waitTime = this.timeConversion(error.timeToWait);
                    return of(new UpdateIsBusySOA({ isBusy: false }), new DisplayBannerSOA({
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
                    return of(new UpdateIsBusySOA({ isBusy: false }), new DisplayBannerSOA({ predefined: 'loginFailure' }));
                }

                return of(new UpdateIsBusySOA({ isBusy: false }), new DisplayBannerSOA({ predefined: 'loginFailure' }));
            })
        ))
    );

    @Effect()
    logoutUser$: Observable<userActions.DestroyCurrentUserSOA | DestroySampleSetSOA> = this.actions$.pipe(
        ofType(userActions.UserMainActionTypes.LogoutUserMSA),
        mergeMap(() => {
            this.router.navigate(['users/login']).catch(() => {
                throw new Error('Unable to navigate.');
            });
            this.dataService.logout();
            return of(new userActions.DestroyCurrentUserSOA(), new DestroySampleSetSOA());
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
