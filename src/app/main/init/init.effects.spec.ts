import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';
import { Observable, ReplaySubject, of, throwError } from 'rxjs';
import { AuthorizationError } from '../../core/model/client-error';
import { TokenRefreshResponseDTO } from '../../core/model/response.model';
import { userForceLogoutMSA, userUpdateCurrentUserSOA } from '../../user/state/user.actions';
import { TokenizedUser } from '../../user/model/user.model';
import { initSSA } from './init.actions';
import { InitEffects } from './init.effects';

// A JWT is only ever read, never verified, by the client: header.payload.signature
// with an `exp` the JwtHelperService can compare against the clock.
function tokenExpiringIn(seconds: number): string {
    const payload = { exp: Math.floor(Date.now() / 1000) + seconds };
    const encode = (value: object) =>
        btoa(JSON.stringify(value)).replace(/=+$/, '');
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

const VALID_TOKEN = tokenExpiringIn(60 * 60);
const EXPIRED_TOKEN = tokenExpiringIn(-60);

function user(token: string): TokenizedUser {
    return {
        email: 'user@lab.de',
        firstName: 'Test',
        lastName: 'User',
        instituteId: 'BfR',
        token: token
    } as TokenizedUser;
}

interface RefreshOutcome {
    storedUser: TokenizedUser | null;
    refresh: () => Observable<TokenRefreshResponseDTO>;
}

function buildEffects({ storedUser, refresh }: RefreshOutcome) {
    const actions$ = new ReplaySubject<Action>(1);
    const dataService = {
        getCurrentUser: jest.fn(() => storedUser),
        setCurrentUser: jest.fn(),
        refreshToken: jest.fn(refresh),
        // The remaining init requests are irrelevant here, they only have to
        // complete so the init stream does.
        getAllInstitutions: jest.fn(() => of([])),
        getAllNRLs: jest.fn(() => of([])),
        getClientDashboardInfo: jest.fn(() => of({ isActive: false })),
        getAllZomoPlanFiles: jest.fn(() => of([]))
    };
    const strapiService = { getWelcomePage: jest.fn(() => of(null)) };
    const logger = { info: jest.fn(), error: jest.fn() };
    const router = { initialNavigation: jest.fn() };

    const effects = new InitEffects(
        actions$ as never,
        logger as never,
        router as never,
        dataService as never,
        strapiService as never
    );
    return {
        effects: effects,
        actions$: actions$,
        dataService: dataService,
        logger: logger
    };
}

/**
 * Collects everything the init effect dispatches for one initSSA, i.e. for one
 * page load.
 */
async function reload(setup: RefreshOutcome): Promise<Action[]> {
    const { effects, actions$ } = buildEffects(setup);
    return new Promise((resolve, reject) => {
        const dispatched: Action[] = [];
        effects.init$.subscribe({
            next: action => dispatched.push(action),
            error: reject
        });
        actions$.next(initSSA());
        // The init stream is synchronous with these mocks; resolve once it drained.
        setTimeout(() => resolve(dispatched), 0);
    });
}

describe('InitEffects.init$ on a page reload', () => {

    it('keeps the user logged in when the token refresh succeeds', async () => {
        const stored = user(VALID_TOKEN);
        const dispatched = await reload({
            storedUser: stored,
            refresh: () => of({ refresh: true, token: VALID_TOKEN })
        });

        expect(dispatched).not.toContainEqual(userForceLogoutMSA());
        expect(dispatched).toContainEqual(
            userUpdateCurrentUserSOA({ user: stored })
        );
    });

    it('keeps the user logged in when the refresh request itself fails', async () => {
        // Regression: the CSRF double-submit check answered POST /v2/tokens with
        // 403 because the XSRF-TOKEN cookie was rotated by the GETs that a page
        // load fires alongside it. Every reload logged the user out, although
        // the token was still perfectly valid.
        const stored = user(VALID_TOKEN);
        const dispatched = await reload({
            storedUser: stored,
            refresh: () =>
                throwError(() => new HttpErrorResponse({
                    status: 403,
                    error: { code: 2, message: 'Invalid CSRF token' }
                }))
        });

        expect(dispatched).not.toContainEqual(userForceLogoutMSA());
        expect(dispatched).toContainEqual(
            userUpdateCurrentUserSOA({ user: stored })
        );
    });

    it('keeps the user logged in when the server cannot be reached at all', async () => {
        const stored = user(VALID_TOKEN);
        const dispatched = await reload({
            storedUser: stored,
            refresh: () =>
                throwError(() => new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }))
        });

        expect(dispatched).not.toContainEqual(userForceLogoutMSA());
        expect(dispatched).toContainEqual(
            userUpdateCurrentUserSOA({ user: stored })
        );
    });

    it('logs the user out when the server rejects the token', async () => {
        const dispatched = await reload({
            storedUser: user(VALID_TOKEN),
            refresh: () => throwError(() => new AuthorizationError('Authorization error.'))
        });

        expect(dispatched).toContainEqual(userForceLogoutMSA());
    });

    it('logs the user out when the server declines to refresh', async () => {
        const dispatched = await reload({
            storedUser: user(VALID_TOKEN),
            refresh: () => of({ refresh: false, token: '' })
        });

        expect(dispatched).toContainEqual(userForceLogoutMSA());
    });

    it('logs the user out when the stored token has expired and cannot be refreshed', async () => {
        const dispatched = await reload({
            storedUser: user(EXPIRED_TOKEN),
            refresh: () =>
                throwError(() => new HttpErrorResponse({ status: 403 }))
        });

        expect(dispatched).toContainEqual(userForceLogoutMSA());
    });

    it('does nothing about the session when no user is stored', async () => {
        const { effects, actions$, dataService } = buildEffects({
            storedUser: null,
            refresh: () => of({ refresh: true, token: VALID_TOKEN })
        });
        const dispatched: Action[] = [];
        effects.init$.subscribe(action => dispatched.push(action));
        actions$.next(initSSA());
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(dataService.refreshToken).not.toHaveBeenCalled();
        expect(dispatched).not.toContainEqual(userForceLogoutMSA());
    });
});
