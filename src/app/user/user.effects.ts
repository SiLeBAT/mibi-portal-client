import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import * as userActions from './state/user.actions';
import { map, catchError, exhaustMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { Router } from '@angular/router';
import { TokenizedUser } from './model/user.model';
import { DisplayBanner } from '../core/state/core.actions';
import { DelayLoginError, AuthorizationError } from '../core/model/client-error';
import { LogService } from '../core/services/log.service';
import { AlertType } from '../core/model/alert.model';
import { UserActionType } from '../shared/model/user-action.model';
import { UserActionService } from '../core/services/user-action.service';

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
        ofType(userActions.UserMainActionTypes.LoginUser),
        exhaustMap((action: userActions.LoginUser) => this.dataService.login(action.payload).pipe(
            map(
                (user: TokenizedUser) => {
                    this.dataService.setCurrentUser(user);
                    return new userActions.LoginUserSuccess(user);
                }),
            catchError((error) => {
                this.logger.error('User authentication failed.', error);
                if (error instanceof DelayLoginError) {
                    const waitTime = this.timeConversion(error.timeToWait);
                    return of(new DisplayBanner({
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
                    return of(new DisplayBanner({ predefined: 'loginFailure' }));
                }

                return of(new DisplayBanner({ predefined: 'loginFailure' }));
            })
        ))
    );

    @Effect()
    logoutUser$ = this.actions$.pipe(
        ofType(userActions.UserMainActionTypes.LogoutUser),
        mergeMap(() => {
            this.router.navigate(['users/login']).catch(() => {
                throw new Error('Unable to navigate.');
            });
            return this.dataService.logout();
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
