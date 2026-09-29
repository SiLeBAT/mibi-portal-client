import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, finalize, map, startWith, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DataService } from '../../core/services/data.service';
import { AuthorizationError } from '../../core/model/client-error';
import { StrapiService } from '../../core/services/strapi.service';
import { LogService } from '../../core/services/log.service';
import { showBannerSOA, updateIsBusySOA, updateClientDashboardInfoSOA, updateZomoPlanFilesSOA, updateWelcomePageSOA } from '../../core/state/core.actions';
import { nrlUpdateNrlsSOA } from '../../shared/nrl/state/nrl.actions';
import { TokenizedUser } from '../../user/model/user.model';
import { userForceLogoutMSA, userUpdateCurrentUserSOA, userUpdateInstitutionsSOA } from '../../user/state/user.actions';
import { initSSA } from './init.actions';

@Injectable()
export class InitEffects {

    private jwtHelper = new JwtHelperService();

    constructor(
        private actions$: Actions,
        private logger: LogService,
        private router: Router,
        private dataService: DataService,
        private strapiService: StrapiService
    ) { }

    init$ = createEffect(() => this.actions$.pipe(
        ofType(initSSA),
        concatMap(() => this.init().pipe(
            startWith(updateIsBusySOA({ isBusy: true })),
            endWith(updateIsBusySOA({ isBusy: false }))
        ))
    ));

    private init(): Observable<Action> {
        return merge(
            this.loadInstitutions(),
            this.loadNRLs(),
            this.loadUser(),
            this.loadClientDashboardInfo(),
            this.loadZomoPlanFiles(),
            this.loadWelcomePage()
        ).pipe(
            finalize(() => {
                this.router.initialNavigation();
            }),
            catchError(() => of(showBannerSOA({ predefined: 'defaultError' })))
        );
    }

    private loadInstitutions(): Observable<Action> {
        return this.dataService.getAllInstitutions().pipe(
            map(institutions => userUpdateInstitutionsSOA({ institutions: institutions })),
            catchError(error => {
                this.logger.error('Unable to fetch institutions', error.stack);
                throw error;
            })
        );
    }

    private loadNRLs(): Observable<Action> {
        return this.dataService.getAllNRLs().pipe(
            map(data => nrlUpdateNrlsSOA({ nrlDTO: data })),
            catchError(error => {
                this.logger.error('Unable to fetch nrls', error.stack);
                throw error;
            })
        );
    }

    private loadZomoPlanFiles(): Observable<Action> {
        return this.dataService.getAllZomoPlanFiles().pipe(
            map(data => updateZomoPlanFilesSOA({ zomoPlanFiles: data })),
            catchError(error => {
                this.logger.error('Unable to fetch zomo plan file years', error.stack);
                throw error;
            })
        );
    }

    private loadClientDashboardInfo(): Observable<Action> {
        return this.dataService.getClientDashboardInfo().pipe(
            tap(data => this.logger.info('InitEffects, loadClientDashboardInfo, data; ', data)),
            map(data => updateClientDashboardInfoSOA({ alternativeWelcomePage: data.isActive })),
            catchError(error => {
                this.logger.error('Unable to fetch client dashboard info', error.stack);
                throw error;
            })
        );
    }

    private loadWelcomePage(): Observable<Action> {
        return this.strapiService.getWelcomePage().pipe(
            map(data => updateWelcomePageSOA({
                isMaintenance: data?.isMaintenance ?? false,
                content: data?.content ?? ''
            }))
        );
    }

    // Legacy JWT bootstrap: rehydrate the session from a persisted token and
    // refresh it. In Keycloak mode no token is persisted, so getCurrentUser()
    // returns null and this is a no-op (the BFF session is loaded via
    // AppAuthService.bootstrap() instead).
    private loadUser(): Observable<Action> {
        const user = this.dataService.getCurrentUser();
        if (user === null) {
            return EMPTY;
        }

        return this.dataService.refreshToken().pipe(
            map(refreshResponse => {
                if (refreshResponse.refresh) {
                    user.token = refreshResponse.token;
                    this.dataService.setCurrentUser(user);
                    return userUpdateCurrentUserSOA({ user: user });
                }
                // The server declined to refresh, so the token is spent.
                return userForceLogoutMSA();
            }),
            catchError((error: unknown) => of(this.onRefreshFailed(error, user)))
        );
    }

    /**
     * Decides what a failed token refresh means for the session.
     *
     * This runs on every page load, so it must not treat "could not reach the
     * refresh endpoint" as "not logged in any more" - that would end the
     * session on a reload whenever a request happened to fail, which is what
     * the rotating XSRF-TOKEN cookie used to cause. Only the server rejecting
     * the token, or a token that has actually expired, ends the session.
     */
    private onRefreshFailed(error: unknown, user: TokenizedUser): Action {
        if (error instanceof AuthorizationError) {
            return userForceLogoutMSA();
        }
        if (this.isExpired(user.token)) {
            return userForceLogoutMSA();
        }
        // Keep the session and carry on with the token from storage: it is
        // still valid, it simply could not be exchanged for a fresh one.
        this.logger.error(
            'Unable to refresh the token, keeping the current session',
            error
        );
        return userUpdateCurrentUserSOA({ user: user });
    }

    private isExpired(token: string): boolean {
        // isTokenExpired returns false if no expirationDate is set, so a token
        // without one counts as expired here (as in AuthGuard).
        return (
            this.jwtHelper.isTokenExpired(token) ||
            this.jwtHelper.getTokenExpirationDate(token) === null
        );
    }

}
