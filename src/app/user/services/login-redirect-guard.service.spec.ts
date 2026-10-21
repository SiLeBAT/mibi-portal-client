import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { selectIsAlternativeWelcomePage } from '../../core/state/core.selectors';
import { LoginRedirectGuard } from './login-redirect-guard.service';

describe('LoginRedirectGuard', () => {
    let store: MockStore;
    let router: Router;
    let guard: LoginRedirectGuard;

    function setAlternativeWelcomePage(isAlternativeWelcomePage: boolean): void {
        store.overrideSelector(selectIsAlternativeWelcomePage, isAlternativeWelcomePage);
        store.refreshState();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideMockStore({ selectors: [{ selector: selectIsAlternativeWelcomePage, value: false }] })
            ]
        });
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        guard = TestBed.inject(LoginRedirectGuard);
        jest.spyOn(store, 'dispatch');
        jest.spyOn(router, 'navigate');
    });

    it('accepts the route on the default welcome page', async () => {
        await expect(firstValueFrom(guard.canActivate())).resolves.toBe(true);
    });

    it('redirects to the home page on the alternative welcome page', async () => {
        setAlternativeWelcomePage(true);

        const result = await firstValueFrom(guard.canActivate());

        expect(result).toBeInstanceOf(UrlTree);
        expect(router.serializeUrl(result as UrlTree)).toBe('/');
    });

    it('has no side effects', async () => {
        setAlternativeWelcomePage(true);

        await firstValueFrom(guard.canActivate());

        expect(router.navigate).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalled();
    });
});
