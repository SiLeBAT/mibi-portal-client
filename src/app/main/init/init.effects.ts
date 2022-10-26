import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY, merge, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, finalize, map, startWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { nrlUpdateNrlsSOA } from '../../shared/nrl/state/nrl.actions';
import { userForceLogoutMSA, userUpdateCurrentUserSOA, userUpdateInstitutionsSOA } from '../../user/state/user.actions';
import { initSSA } from './init.actions';

@Injectable()
export class InitEffects {

    constructor(
        private actions$: Actions,
        private logger: LogService,
        private router: Router,
        private dataService: DataService
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
            this.loadUser()
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

    private loadUser(): Observable<Action> {
        const user = this.dataService.getCurrentUser();
        if(user === null) {
            return EMPTY;
        }

        return this.dataService.refreshToken().pipe(
            map(refreshResponse => {
                if (refreshResponse.refresh) {
                    user.token = refreshResponse.token;
                    this.dataService.setCurrentUser(user);
                    return userUpdateCurrentUserSOA({ user: user });
                }
                return userForceLogoutMSA();
            }),
            catchError(() => of(userForceLogoutMSA()))
        );
    }
}
