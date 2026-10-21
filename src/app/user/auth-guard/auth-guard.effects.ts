import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { of } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { showBannerSOA } from '../../core/state/core.actions';
import { userForceLogoutMSA } from '../state/user.actions';
import { AUTH_GUARD_REJECTED_STATE } from './auth-guard.constants';

// Side effects of a rejection by AuthGuard, which itself only redirects.
@Injectable()
export class UserAuthGuardEffects {

    constructor(
        private actions$: Actions,
        private router: Router
    ) { }

    authGuardRejected$ = createEffect(() => this.actions$.pipe(
        ofType(routerNavigatedAction),
        filter(() => this.router.lastSuccessfulNavigation()?.extras.state?.[AUTH_GUARD_REJECTED_STATE] === true),
        concatMap(() => of(
            userForceLogoutMSA(),
            showBannerSOA({ predefined: 'loginUnauthorized' })
        ))
    ));
}
