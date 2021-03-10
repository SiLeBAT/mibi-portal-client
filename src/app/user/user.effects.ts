import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as moment from 'moment';
import { map, catchError, mergeMap, tap, withLatestFrom, filter, concatMap, first, concatMapTo } from 'rxjs/operators';
import { of, Observable, EMPTY, iif, from, merge } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { Router } from '@angular/router';
import { TokenizedUser, UserState } from './model/user.model';
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA, ShowCustomBannerSOA } from '../core/state/core.actions';
import { DelayLoginError, AuthorizationError } from '../core/model/client-error';
import { LogService } from '../core/services/log.service';
import { AlertType } from '../core/model/alert.model';
import { UserActionType } from '../shared/model/user-action.model';
import { UserActionService } from '../core/services/user-action.service';
import { DestroySampleSetSOA } from '../samples/state/samples.actions';
import { Store } from '@ngrx/store';
import { UserMainSlice } from './user.state';
import { UserMainActionTypes, LoginUserMSA, UpdateCurrentUserSOA, DestroyCurrentUserSOA, LogoutUserMSA, UpdateAuthSSA, LoginSSA, LogoutSSA, RedirectUserMSA, UpdateUserStateSOA, CheckAuthMSA, RequestLogoutSSA } from './state/user.actions';
import { selectAuthInfo, selectCurrentUser, selectUserState } from './state/user.selectors';
import { DialogActionTypes, DialogCancelMTA, DialogConfirmMTA, DialogOpenMTA } from '../shared/dialog/state/dialog.actions';
import { ofTarget } from '../shared/ngrx/multi-target-action';
import { selectHasEntries } from '../samples/state/samples.selectors';
import { SamplesMainSlice } from '../samples/samples.state';

@Injectable()
export class UserMainEffects {

    constructor(private actions$: Actions,
        private dataService: DataService,
        private userActionService: UserActionService,
        private router: Router,
        private logger: LogService,
        private store$: Store<UserMainSlice & SamplesMainSlice>) {
    }

    @Effect()
    userBackChannel$: Observable<CheckAuthMSA> = merge(
        this.dataService.backChannelAuthEvent$.pipe(
            filter(message => message === 'logout'),
            tap(() => {
                this.store$.dispatch(new CheckAuthMSA());
            })
        ),
        this.dataService.backChannelConnection$.pipe(
            filter(event => event === 'opened'),
        )
    ).pipe(
        map(() => new CheckAuthMSA())
    )

    @Effect()
    checkAuth$: Observable<UpdateAuthSSA | ShowCustomBannerSOA | DialogOpenMTA> = this.actions$.pipe(
        ofType<CheckAuthMSA>(UserMainActionTypes.CheckAuthMSA),
        tap(() => {
            console.log('befor concat');
        }),
        // state has to be checked inside concatMap before each userInfo request
        concatMap(() => this.store$.select(selectUserState).pipe(
            first(),
            tap(() => {
                console.log('after concat');
            }),
            filter(state => state !== UserState.LOGGED_OFF),
            tap(() => {
                console.log('before check');
            }),
            mergeMap(() => this.dataService.getUserInfo().pipe(
                tap(() => {
                    console.log('after check');
                }),
                map(authUser => new UpdateAuthSSA({ userInfo: authUser })),
                catchError((error) => {
                    if (error instanceof AuthorizationError) {
                        return of(
                            new DialogOpenMTA('userRequestInvalid', {
                                configuration: {
                                    title: 'Authentifizierungs-Fehler',
                                    message: 'Es gibt ein Problem mit der Authentifizierung. Bitte melden Sie sich ab und gegebenfalls erneut an.',
                                    warnings: [],
                                    confirmButtonConfig: {
                                        label: 'Abmelden'
                                    },
                                },
                                closable: false
                            })
                        )
                    } else {
                        return EMPTY;
                    }
                })
            ))
        ))
    )

    @Effect()
    updateAuth$: Observable<UpdateUserStateSOA | LoginSSA | RequestLogoutSSA> = this.actions$.pipe(
        ofType<UpdateAuthSSA>(UserMainActionTypes.UpdateAuthSSA),
        withLatestFrom(this.store$.select(selectAuthInfo)),
        tap(() => {
            console.log('before update concat');
        }),
        concatMap(([action, authInfo]) => {
            console.log('after update concat');
            // fail safe
            if (authInfo.state === UserState.LOGGED_OFF) {
                return EMPTY;
            }
            const currentUser = authInfo.currentUser;
            const authUser = action.payload.userInfo;
            if (currentUser !== null) {
                if (authUser !== null && authUser.id === currentUser.id) {
                    if (authInfo.state === UserState.UNINITIALIZED) {
                        return of(new UpdateUserStateSOA({ state: UserState.LOGGED_ON }));
                    }
                } else if (authUser !== null && authUser.id !== currentUser.id) {
                    return of(
                        new UpdateUserStateSOA({ state: UserState.LOGGED_OFF }),
                        new RequestLogoutSSA({ currentUser: currentUser, userChanged: true }),
                    );
                } else {
                    return of(
                        new UpdateUserStateSOA({ state: UserState.LOGGED_OFF }),
                        new RequestLogoutSSA({ currentUser: currentUser, userChanged: false }),
                    );
                }
            } else {
                if (authUser !== null) {
                    if (authInfo.state === UserState.UNINITIALIZED) {
                        return of(
                            new UpdateUserStateSOA({ state: UserState.LOGGED_ON }),
                            new LoginSSA(authUser),
                        );
                    }
                } else {
                    return of(new UpdateUserStateSOA({ state: UserState.LOGGED_OFF }));
                }
            }
            return EMPTY;
        })
    );

    @Effect()
    requestLogout$: Observable<DialogOpenMTA> = this.actions$.pipe(
        ofType<RequestLogoutSSA>(UserMainActionTypes.RequestLogoutSSA),
        withLatestFrom(this.store$.select(selectHasEntries)),
        map(([action, hasEntries]) => {
            if (action.payload.userChanged) {
                return new DialogOpenMTA('userRequestChange', {
                    configuration: {
                        title: 'Ihre Anmelde-Identität hat sich geändert',
                        message: 'Sie haben sich mit einer anderen Identität beim MiBi-Portal angemeldet. Sie können entweder Ihre aktuelle Session beenden oder sich erneut als ' + action.payload.currentUser.userName + ' anmelden um fortzufahren.',
                        warnings: hasEntries ? ['Achtung! Wenn Sie die Session beenden gehen Ihre Daten verloren.'] : [],
                        confirmButtonConfig: {
                            label: 'Anmelden'
                        },
                        cancelButtonConfig: {
                            label: 'Session beenden'
                        }
                    },
                    closable: false
                })
            } else {
                return new DialogOpenMTA('userRequestLogout', {
                    configuration: {
                        title: 'Sie wurden abgemeldet',
                        message: 'Sie wurden vom MiBi-Portal abgemeldet. Sie können entweder Ihre Session beenden oder sich erneut als ' + action.payload.currentUser.userName + ' anmelden.',
                        warnings: hasEntries ? ['Achtung! Wenn Sie die Session beenden gehen Ihre Daten verloren.'] : [],
                        confirmButtonConfig: {
                            label: 'Anmelden'
                        },
                        cancelButtonConfig: {
                            label: 'Session beenden'
                        }
                    },
                    closable: false
                })
            }
        })
    )

    @Effect()
    requestLogoutCancel$: Observable<LogoutSSA> = this.actions$.pipe(
        ofType<DialogCancelMTA>(DialogActionTypes.DialogCancelMTA),
        ofTarget<DialogCancelMTA>('userRequestLogout', 'userRequestChange'),
        concatMap(() => {
            return from(this.router.navigate([''])).pipe(
                map(() => new LogoutSSA())
            )
        })
    );

    @Effect()
    requestLogoutConfirm$: Observable<RedirectUserMSA> = this.actions$.pipe(
        ofType<DialogConfirmMTA>(DialogActionTypes.DialogConfirmMTA),
        ofTarget<DialogConfirmMTA>('userRequestLogout', 'userRequestChange', 'userRequestInvalid'),
        map(action => {
            let url = this.router.url;
            if (action.target !== 'userRequestInvalid') {
                url = this.addRedirectToUrl('/client/login', url);
            }
            if (action.target !== 'userRequestLogout') {
                url = this.addRedirectToUrl('/client/logout', url);
            }
            return new RedirectUserMSA({ url: url });
        })
    );

    @Effect()
    login$: Observable<UpdateCurrentUserSOA | ShowCustomBannerSOA> = this.actions$.pipe(
        ofType<LoginSSA>(UserMainActionTypes.LoginSSA),
        concatMap((action) => of(
            new UpdateCurrentUserSOA(action.payload),
            new ShowCustomBannerSOA({
                banner: {
                    message: 'Sie sind jetzt als ' + action.payload.userName + ' angemeldet.',
                    type: AlertType.SUCCESS,
                    mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                }
            })
        ))
    );

    @Effect()
    logout$: Observable<DestroyCurrentUserSOA | DestroySampleSetSOA | ShowCustomBannerSOA> = this.actions$.pipe(
        ofType<LogoutSSA>(UserMainActionTypes.LogoutSSA),
        concatMap(() => from(this.router.navigate([''])).pipe(
            concatMap(() => of(
                new DestroyCurrentUserSOA(),
                new DestroySampleSetSOA(),
                new ShowCustomBannerSOA({
                    banner: {
                        message: 'Ihre Session wurde beendet.',
                        type: AlertType.SUCCESS,
                        mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
                    }
                })
            ))
        ))
    );

    @Effect()
    logoutUser$: Observable<DestroyCurrentUserSOA | RedirectUserMSA | DialogOpenMTA> = this.actions$.pipe(
        ofType<LogoutUserMSA>(UserMainActionTypes.LogoutUserMSA),
        withLatestFrom(this.store$.select(selectHasEntries)),
        concatMap(([, hasEntries]) => {
            if (hasEntries) {
                return of(new DialogOpenMTA('userLogout', {
                    configuration: {
                        title: 'Abmelden',
                        message: 'Wenn Sie sich abmelden gehen Ihre Daten verloren.',
                        warnings: [],
                        confirmButtonConfig: {
                            label: 'Abmelden'
                        },
                        cancelButtonConfig: {
                            label: 'Abbrechen'
                        }
                    },
                    closable: true
                }))
            } else {
                return from(this.router.navigate([''])).pipe(
                    concatMap(() => of(
                        new DestroyCurrentUserSOA(),
                        new RedirectUserMSA({ url: '/client/logout' })
                    ))
                )
            }
        })
    );

    @Effect()
    userLogoutConfirm: Observable<DestroySampleSetSOA | LogoutUserMSA> = this.actions$.pipe(
        ofType<DialogConfirmMTA>(DialogActionTypes.DialogConfirmMTA),
        ofTarget<DialogConfirmMTA>('userLogout'),
        concatMap(() => of(
            new DestroySampleSetSOA(),
            new LogoutUserMSA()
        ))
    )

    @Effect()
    loginUser$: Observable<RedirectUserMSA> = this.actions$.pipe(
        ofType<LoginUserMSA>(UserMainActionTypes.LoginUserMSA),
        map(() => {
            const url = this.addRedirectToUrl('/client/login', this.router.url);
            return new RedirectUserMSA({ url: url })
        })
    )

    // @Effect({ dispatch: false })
    @Effect()
    redirectUser$: Observable<UpdateIsBusySOA> = this.actions$.pipe(
        ofType<RedirectUserMSA>(UserMainActionTypes.RedirectUserMSA),
        map(action => {
            window.location.href = action.payload.url;
            return new UpdateIsBusySOA({ isBusy: true });
        })
    )

    // @Effect()
    // loginUser$: Observable<ShowBannerSOA | ShowCustomBannerSOA | UpdateCurrentUserSOA | UpdateIsBusySOA> = this.actions$.pipe(
    //     ofType<LoginUserSSA>(UserMainActionTypes.LoginUserSSA),
    //     tap(() => {
    //         this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
    //         this.store$.dispatch(new HideBannerSOA());
    //     }),
    //     exhaustMap((action) => this.dataService.login(action.payload).pipe(
    //         map(
    //             (user: TokenizedUser) => {
    //                 this.dataService.setCurrentUser(user);
    //                 return of(
    //                     new UpdateIsBusySOA({ isBusy: false }),
    //                     new UpdateCurrentUserSOA(user)
    //                 );
    //             }),
    //         concatAll(),
    //         catchError((error) => {
    //             this.logger.error('User authentication failed.', error);
    //             if (error instanceof DelayLoginError) {
    //                 const waitTime = this.timeConversion(error.timeToWait);
    //                 return of(
    //                     new UpdateIsBusySOA({ isBusy: false }),
    //                     new ShowCustomBannerSOA({
    //                         banner: {
    //                             message: `Zu viele fehlgeschlagene Logins, bitte warten Sie ${waitTime
    //                                 }.`,
    //                             type: AlertType.ERROR,
    //                             mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
    //                         }
    //                     }));

    //             } if (error instanceof AuthorizationError) {
    //                 return of(
    //                     new UpdateIsBusySOA({ isBusy: false }),
    //                     new ShowBannerSOA({ predefined: 'loginFailure' })
    //                 );
    //             }

    //             return of(
    //                 new UpdateIsBusySOA({ isBusy: false }),
    //                 new ShowBannerSOA({ predefined: 'loginFailure' })
    //             );
    //         })
    //     ))
    // );

    // @Effect()
    // logoutUser$: Observable<DestroyCurrentUserSOA | DestroySampleSetSOA> = this.actions$.pipe(
    //     ofType<LogoutUserMSA>(UserMainActionTypes.LogoutUserMSA),
    //     mergeMap(() => {
    //         this.router.navigate(['']).catch(() => {
    //             throw new Error('Unable to navigate.');
    //         });
    //         // this.dataService.logout();
    //         return of(new DestroyCurrentUserSOA(), new DestroySampleSetSOA());
    //     })
    // );

    // private timeConversion(diffToDelay: number): string {
    //     moment.locale('de');

    //     const diffDuration = moment.duration(diffToDelay, 'seconds');
    //     const minutes = ('0' + diffDuration.minutes().toString()).slice(-2);
    //     const seconds = ('0' + diffDuration.seconds().toString()).slice(-2);

    //     return `${minutes}:${seconds} Min`;
    // }

    private addRedirectToUrl(url: string, redirectUrl: string): string {
        const urlTree = this.router.createUrlTree([url], {
            queryParams: {
                redirect_url: redirectUrl
            }
        });
        return this.router.serializeUrl(urlTree);
    }
}
