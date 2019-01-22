import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as userActions from './user.actions';
import * as coreActions from '../../core/state/core.actions';
import { map, catchError, exhaustMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { AlertType } from '../../core/model/alert.model';
import { LoginResponseDTO } from '../../core/model/response.model';
import { Router } from '@angular/router';
import { UserActionService } from '../../core/services/user-action.service';
import { UserActionType } from '../../shared/model/user-action.model';

@Injectable()
export class UserEffects {

    constructor(private actions$: Actions,
        private dataService: DataService,
        private router: Router,
        private userActionService: UserActionService) {
    }

    @Effect()
    loginUser$ = this.actions$.pipe(
        ofType(userActions.UserActionTypes.LoginUser),
        exhaustMap((action: userActions.LoginUser) => this.dataService.login(action.payload).pipe(
            map(
                (loginResponse: LoginResponseDTO) => {
                    if (loginResponse.obj && loginResponse.obj.token) {
                        this.dataService.setCurrentUser(loginResponse.obj);
                        return new userActions.LoginUserSuccess(loginResponse.obj);
                    } else {
                        return new coreActions.DisplayBanner({
                            predefined: '',
                            custom: {
                                message: loginResponse.title,
                                type: AlertType.ERROR,
                                mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                            }
                        });
                    }
                }),
            catchError(() => of(new coreActions.DisplayBanner({ predefined: 'loginFailure' })))
        ))
    );

    @Effect()
    logoutUser$ = this.actions$.pipe(
        ofType(userActions.UserActionTypes.LogoutUser),
        mergeMap(() => {
            this.router.navigate(['users/login']).catch(() => {
                throw new Error('Unable to navigate.');
            });
            return this.dataService.logout();
        })
    );
}
