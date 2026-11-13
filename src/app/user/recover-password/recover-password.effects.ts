import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AlertType } from '../../core/model/alert.model';
import { PasswordResetRequestResponseDTO } from '../../core/model/response.model';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { UserActionService } from '../../core/services/user-action.service';
import { showCustomBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { UserActionType } from '../../shared/model/user-action.model';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { UserLinkProviderService } from '../link-provider.service';
import { userRecoverPasswordSSA } from './recover-password.actions';
import { userRecoverPasswordStrings } from './recover-password.constants';

@Injectable()
export class UserRecoverPasswordEffects {

    constructor(
        private actions$: Actions,
        private dataService: DataService,
        private userActionService: UserActionService,
        private logger: LogService,
        private userLinks: UserLinkProviderService
    ) { }

    recoverPassword$ = createEffect(() => this.actions$.pipe(
        ofType(userRecoverPasswordSSA),
        concatMap(action =>
            this.recoverPassword(action.email).pipe(
                startWith(
                    updateIsBusySOA({ isBusy: true })
                ),
                endWith(
                    updateIsBusySOA({ isBusy: false })
                )
            ))
    ));

    private recoverPassword(email: string): Observable<Action> {
        return this.dataService.resetPasswordRequest(email).pipe(
            concatMap((response: PasswordResetRequestResponseDTO) => of(
                navigateMSA({ path: this.userLinks.login }),
                this.banner(
                    userRecoverPasswordStrings.success(response.email),
                    AlertType.SUCCESS
                )
            )),
            catchError((error) => {
                this.logger.error('Failed to request a password reset.', error.stack);
                return of(this.banner(
                    userRecoverPasswordStrings.failure(email, environment.supportContact),
                    AlertType.ERROR
                ));
            })
        );
    }

    private banner(message: string, type: AlertType): Action {
        return showCustomBannerSOA({
            banner: {
                message: message,
                type: type,
                mainAction: {
                    ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER)
                }
            }
        });
    }
}
