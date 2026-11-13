import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AlertType } from '../../core/model/alert.model';
import { RegistrationRequestResponseDTO } from '../../core/model/response.model';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { UserActionService } from '../../core/services/user-action.service';
import { showCustomBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { UserActionType } from '../../shared/model/user-action.model';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { UserLinkProviderService } from '../link-provider.service';
import { RegistrationDetails } from '../model/user.model';
import { userRegisterSSA } from './register.actions';
import { userRegisterStrings } from './register.constants';

@Injectable()
export class UserRegisterEffects {

    constructor(
        private actions$: Actions,
        private dataService: DataService,
        private userActionService: UserActionService,
        private logger: LogService,
        private userLinks: UserLinkProviderService
    ) { }

    register$ = createEffect(() => this.actions$.pipe(
        ofType(userRegisterSSA),
        concatMap(action =>
            this.register(action.details).pipe(
                startWith(
                    updateIsBusySOA({ isBusy: true })
                ),
                endWith(
                    updateIsBusySOA({ isBusy: false })
                )
            ))
    ));

    private register(details: RegistrationDetails): Observable<Action> {
        return this.dataService.registrationRequest({
            email: details.email,
            password: details.password,
            firstName: details.firstName,
            lastName: details.lastName,
            instituteId: details.instituteId
        }).pipe(
            concatMap((response: RegistrationRequestResponseDTO) => of(
                navigateMSA({ path: this.userLinks.login }),
                this.banner(
                    userRegisterStrings.success(response.email),
                    AlertType.SUCCESS
                )
            )),
            catchError((error) => {
                this.logger.error('User registration failed.', error.stack);
                return of(this.banner(
                    userRegisterStrings.failure(details.email, environment.supportContact),
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
