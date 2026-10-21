import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RedirectCommand, Router, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { TokenizedUser } from '../model/user.model';
import { selectUserCurrentUser } from '../state/user.selectors';
import { AUTH_GUARD_REJECTED_STATE } from '../auth-guard/auth-guard.constants';
import { AuthGuard } from './auth-guard.service';

const LOGIN_PATH = '/users/login';
const PROFILE_PATH = '/users/profile';

function createToken(payload: object): string {
    const encode = (value: object) => btoa(JSON.stringify(value))
        .replace(/=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function createUser(token: string): TokenizedUser {
    return { token: token } as TokenizedUser;
}

const nowInSeconds = () => Math.floor(Date.now() / 1000);
const validUser = createUser(createToken({ exp: nowInSeconds() + 3600 }));
const expiredUser = createUser(createToken({ exp: nowInSeconds() - 3600 }));
const userWithoutExpiration = createUser(createToken({ sub: 'u1' }));

@Component({ template: '' })
class EmptyComponent { }

describe('AuthGuard', () => {
    let store: MockStore;
    let router: Router;
    let guard: AuthGuard;

    function setCurrentUser(user: TokenizedUser | null): void {
        store.overrideSelector(selectUserCurrentUser, user);
        store.refreshState();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    { path: 'users/profile', component: EmptyComponent, canActivate: [AuthGuard] },
                    { path: 'users/login', component: EmptyComponent }
                ]),
                provideMockStore({ selectors: [{ selector: selectUserCurrentUser, value: null }] })
            ]
        });
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        guard = TestBed.inject(AuthGuard);
        jest.spyOn(store, 'dispatch');
        jest.spyOn(router, 'navigate');
        jest.spyOn(router, 'navigateByUrl');
    });

    it('accepts the route for a user with a valid token', async () => {
        setCurrentUser(validUser);

        await expect(firstValueFrom(guard.canActivate())).resolves.toBe(true);
    });

    describe.each([
        ['no user', null],
        ['a user with an expired token', expiredUser],
        ['a user with a token without expiration date', userWithoutExpiration]
    ])('for %s', (_description, user) => {
        let result: true | RedirectCommand;

        beforeEach(async () => {
            setCurrentUser(user);
            result = await firstValueFrom(guard.canActivate());
        });

        it('redirects to the login page and marks the redirect as rejected', () => {
            expect(result).toBeInstanceOf(RedirectCommand);
            const command = result as RedirectCommand;
            expect(router.serializeUrl(command.redirectTo)).toBe(LOGIN_PATH);
            expect(command.navigationBehaviorOptions?.state).toEqual({ [AUTH_GUARD_REJECTED_STATE]: true });
        });

        it('has no side effects', () => {
            expect(store.dispatch).not.toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
            expect(router.navigateByUrl).not.toHaveBeenCalled();
        });
    });

    it('completes after the first decision', () => {
        setCurrentUser(validUser);
        const emitted: unknown[] = [];
        let completed = false;

        guard.canActivate().subscribe({ next: value => emitted.push(value), complete: () => completed = true });
        setCurrentUser(null);

        expect(emitted).toEqual([true]);
        expect(completed).toBe(true);
    });

    describe('in the router', () => {
        it('lands on the login page with the rejected state', async () => {
            await router.navigateByUrl(PROFILE_PATH);

            expect(router.url).toBe(LOGIN_PATH);
            expect(router.lastSuccessfulNavigation()?.extras.state).toEqual({ [AUTH_GUARD_REJECTED_STATE]: true });
        });

        it('opens the guarded page for a user with a valid token', async () => {
            setCurrentUser(validUser);

            await router.navigateByUrl(PROFILE_PATH);

            expect(router.url).toBe(PROFILE_PATH);
            expect(router.lastSuccessfulNavigation()?.extras.state).toBeUndefined();
        });
    });
});
