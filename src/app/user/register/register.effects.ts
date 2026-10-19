import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith, withLatestFrom } from 'rxjs/operators';
import { ContentMainSlice } from '../../content/content.state';
import { selectSupportContact } from '../../content/state/content.selectors';
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
        private store$: Store<ContentMainSlice>,
        private dataService: DataService,
        private userActionService: UserActionService,
        private logger: LogService,
        private userLinks: UserLinkProviderService
    ) { }

    register$ = createEffect(() => this.actions$.pipe(
        ofType(userRegisterSSA),
        // The failure message names the support address, so it is read when the
        // request starts rather than kept on the component.
        withLatestFrom(this.store$.select(selectSupportContact)),
        concatMap(([action, supportContact]) =>
            this.register(action.details, supportContact).pipe(
                startWith(
                    updateIsBusySOA({ isBusy: true })
                ),
                endWith(
                    updateIsBusySOA({ isBusy: false })
                )
            ))
    ));

    private register(
        details: RegistrationDetails,
        supportContact: string
    ): Observable<Action> {
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
                    userRegisterStrings.failure(details.email, supportContact),
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
