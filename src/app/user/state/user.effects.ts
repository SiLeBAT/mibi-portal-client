import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as userActions from './user.actions';
import * as fromSamples from '../..//samples/state/samples.reducer';
import * as coreActions from '../../core/state/core.actions';
import { map, catchError, exhaustMap, mergeMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { AlertType } from '../../core/model/alert.model';
import { ILoginResponseDTO } from '../../core/model/response.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

@Injectable()
export class UserEffects {

    constructor(private actions$: Actions,
        private dataService: DataService,
        private router: Router,
        private store: Store<fromSamples.State>) {
    }

    @Effect()
    loginUser$ = this.actions$.pipe(
        ofType(userActions.UserActionTypes.LoginUser),
        exhaustMap((action: userActions.LoginUser) => this.dataService.login(action.payload).pipe(
            withLatestFrom(this.store),
            map(
                (dataStateCombine: [ILoginResponseDTO, fromSamples.State]) => {
                    if (dataStateCombine[0].obj && dataStateCombine[0].obj.token) {
                        this.dataService.setCurrentUser(dataStateCombine[0].obj);
                        if (fromSamples.hasEntries(dataStateCombine[1])) {
                            this.router.navigate(['samples']).catch(() => {
                                throw new Error('Unable to navigate.');
                            });

                        } else {
                            this.router.navigate(['users/profile']).catch(() => {
                                throw new Error('Unable to navigate.');
                            });
                        }
                        return new userActions.LoginUserSuccess({
                            firstName: dataStateCombine[0].obj.firstName,
                            lastName: dataStateCombine[0].obj.lastName,
                            email: dataStateCombine[0].obj.email,
                            userData: dataStateCombine[0].obj.userData,
                            institution: dataStateCombine[0].obj.institution,
                            _id: dataStateCombine[0].obj._id
                        });
                    } else {
                        return new coreActions.DisplayBanner({
                            predefined: '',
                            custom: {
                                message: dataStateCombine[0].title,
                                type: AlertType.ERROR
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
