import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { UserLinkProviderService } from '../link-provider.service';
import { userLogoutMSA } from '../state/user.actions';
import { AppAuthService } from './app-auth.service';
import { KeycloakAuthService } from './keycloak-auth.service';

function make(keycloakEnabled: boolean) {
    const dispatch = jest.fn();
    const keycloak = {
        login: jest.fn(),
        logout: jest.fn().mockReturnValue(of(null)),
        me: jest.fn().mockReturnValue(of({ sub: 'u1' }))
    };
    const store = { dispatch: dispatch } as unknown as Store;
    const userLinks = {
        login: '/users/login'
    } as unknown as UserLinkProviderService;
    const service = new AppAuthService(
        keycloakEnabled,
        keycloak as unknown as KeycloakAuthService,
        store,
        userLinks
    );
    return { service: service, dispatch: dispatch, keycloak: keycloak };
}

describe('AppAuthService', () => {
    describe('keycloak mode', () => {
        it('login redirects via Keycloak', () => {
            const { service, keycloak } = make(true);
            service.login();
            expect(keycloak.login).toHaveBeenCalled();
        });

        it('logout calls the Keycloak BFF', () => {
            const { service, keycloak } = make(true);
            service.logout();
            expect(keycloak.logout).toHaveBeenCalled();
        });

        it('bootstrap hydrates the session from /v2/auth/me', async () => {
            const { service, keycloak } = make(true);
            await service.bootstrap();
            expect(keycloak.me).toHaveBeenCalled();
        });

        it('bootstrap swallows session errors so the app still boots', async () => {
            const { service, keycloak } = make(true);
            keycloak.me.mockReturnValue(throwError(() => new Error('401')));
            await expect(service.bootstrap()).resolves.toBeNull();
        });
    });

    describe('legacy mode', () => {
        it('login navigates to the credential login page', () => {
            const { service, dispatch, keycloak } = make(false);
            service.login();
            expect(dispatch).toHaveBeenCalledWith(
                navigateMSA({ path: '/users/login' })
            );
            expect(keycloak.login).not.toHaveBeenCalled();
        });

        it('logout dispatches userLogoutMSA', () => {
            const { service, dispatch, keycloak } = make(false);
            service.logout();
            expect(dispatch).toHaveBeenCalledWith(userLogoutMSA());
            expect(keycloak.logout).not.toHaveBeenCalled();
        });

        it('bootstrap is a no-op (legacy session loads via InitEffects)', async () => {
            const { service, keycloak } = make(false);
            await expect(service.bootstrap()).resolves.toBeNull();
            expect(keycloak.me).not.toHaveBeenCalled();
        });
    });
});
