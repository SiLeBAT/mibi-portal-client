import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { UserLinkProviderService } from '../link-provider.service';
import { userResetPasswordSSA } from './reset-password.actions';

@Injectable()
export class UserResetPasswordEffects {

    constructor(
        private actions$: Actions,
        private dataService: DataService,
        private logger: LogService,
        private userLinks: UserLinkProviderService
    ) { }

    resetPassword$ = createEffect(() => this.actions$.pipe(
        ofType(userResetPasswordSSA),
        concatMap(action =>
            this.resetPassword(action.password, action.token).pipe(
                startWith(
                    updateIsBusySOA({ isBusy: true })
                ),
                endWith(
                    updateIsBusySOA({ isBusy: false })
                )
            ))
    ));

    private resetPassword(password: string, token: string): Observable<Action> {
        return this.dataService.resetPassword(password, token).pipe(
            concatMap(() => of(
                navigateMSA({ path: this.userLinks.login }),
                showBannerSOA({ predefined: 'passwordChangeSuccess' })
            )),
            catchError((error) => {
                this.logger.error('Failed to set a new password.', error.stack);
                return of(showBannerSOA({ predefined: 'passwordChangeFailure' }));
            })
        );
    }
}
