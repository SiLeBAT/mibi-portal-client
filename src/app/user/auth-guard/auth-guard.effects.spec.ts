import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { showBannerSOA } from '../../core/state/core.actions';
import { userForceLogoutMSA } from '../state/user.actions';
import { AUTH_GUARD_REJECTED_STATE } from './auth-guard.constants';
import { UserAuthGuardEffects } from './auth-guard.effects';

describe('UserAuthGuardEffects', () => {
    let actions$: ReplaySubject<Action>;
    let lastSuccessfulNavigation: jest.Mock;

    function effects(): UserAuthGuardEffects {
        return new UserAuthGuardEffects(
            actions$ as never,
            { lastSuccessfulNavigation: lastSuccessfulNavigation } as unknown as Router
        );
    }

    function emitted(): Action[] {
        const actions: Action[] = [];
        effects().authGuardRejected$.subscribe(action => actions.push(action));
        return actions;
    }

    const navigated = () => routerNavigatedAction({ payload: {} as never });

    beforeEach(() => {
        actions$ = new ReplaySubject<Action>(1);
        lastSuccessfulNavigation = jest.fn().mockReturnValue(null);
    });

    it('logs out the user and shows the banner after a redirect by the AuthGuard', async () => {
        lastSuccessfulNavigation.mockReturnValue({ extras: { state: { [AUTH_GUARD_REJECTED_STATE]: true } } });
        const seen = firstValueFrom(effects().authGuardRejected$.pipe(take(2), toArray()));

        actions$.next(navigated());

        expect(await seen).toEqual([
            userForceLogoutMSA(),
            showBannerSOA({ predefined: 'loginUnauthorized' })
        ]);
    });

    it.each([
        ['no navigation', null],
        ['a navigation without state', { extras: {} }],
        ['a navigation with other state', { extras: { state: { other: true } } }]
    ])('does nothing after %s', (_description, navigation) => {
        lastSuccessfulNavigation.mockReturnValue(navigation);
        actions$.next(navigated());

        expect(emitted()).toEqual([]);
    });

    it('ignores other actions', () => {
        lastSuccessfulNavigation.mockReturnValue({ extras: { state: { [AUTH_GUARD_REJECTED_STATE]: true } } });
        actions$.next(userForceLogoutMSA());

        expect(emitted()).toEqual([]);
    });
});
