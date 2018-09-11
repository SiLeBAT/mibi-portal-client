import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as userActions from './user.actions';
import { map, catchError, exhaustMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { AlertType } from '../../core/model/alert.model';
import { ILoginResponseDTO } from '../../core/model/response.model';
import { Router } from '@angular/router';

@Injectable()
export class UserEffects {

    constructor(private actions$: Actions,
        private dataService: DataService,
        private router: Router) {
    }

    @Effect()
    loginUser$ = this.actions$.pipe(
        ofType(userActions.UserActionTypes.LoginUser),
        exhaustMap((action: userActions.LoginUser) => this.dataService.login(action.payload).pipe(
            map((response: ILoginResponseDTO) => {
                if (response.obj && response.obj.token) {
                    this.dataService.setCurrentUser(response.obj);
                    this.router.navigate(['users/profile']).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                    return new userActions.LoginUserSuccess({
                        firstName: response.obj.firstName,
                        lastName: response.obj.lastName,
                        email: response.obj.email,
                        userData: response.obj.userData,
                        institution: response.obj.institution,
                        _id: response.obj._id
                    });
                } else {
                    return new userActions.LoginUserFailure({
                        message: response.title,
                        type: AlertType.ERROR
                    });
                }
            }),
            catchError(() => of(new userActions.LoginUserFailure({
                message: 'Unable to login',
                type: AlertType.ERROR
            })))
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
