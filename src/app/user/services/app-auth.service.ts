import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, firstValueFrom, of } from 'rxjs';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { UserLinkProviderService } from '../link-provider.service';
import { userLogoutMSA } from '../state/user.actions';
import { KEYCLOAK_ENABLED } from './auth.tokens';
import { KeycloakAuthService } from './keycloak-auth.service';

/**
 * Single entry point for auth actions that differ between the legacy JWT flow
 * and the Keycloak BFF flow. Components and effects depend on this facade
 * instead of branching on the flag themselves, so the toggle lives in one place.
 *
 * Legacy mode:
 *   - login  -> navigate to the credential login page (the form dispatches the
 *               actual login action)
 *   - logout -> dispatch userLogoutMSA (NgRx effect clears state + navigates)
 *   - bootstrap -> no-op (InitEffects.loadUser restores the session from the
 *               persisted token)
 * Keycloak mode:
 *   - login  -> redirect to the Keycloak authorization endpoint
 *   - logout -> call the BFF logout endpoint, then redirect to end-session
 *   - bootstrap -> hydrate the current user from the BFF session via /v2/auth/me
 */
@Injectable({ providedIn: 'root' })
export class AppAuthService {
    constructor(
        @Inject(KEYCLOAK_ENABLED) readonly keycloakEnabled: boolean,
        private keycloak: KeycloakAuthService,
        private store$: Store,
        private userLinks: UserLinkProviderService
    ) {}

    login(): void {
        if (this.keycloakEnabled) {
            this.keycloak.login();
        } else {
            this.store$.dispatch(navigateMSA({ path: this.userLinks.login }));
        }
    }

    logout(): void {
        if (this.keycloakEnabled) {
            this.keycloak.logout().subscribe();
        } else {
            this.store$.dispatch(userLogoutMSA());
        }
    }

    async bootstrap(): Promise<unknown> {
        if (!this.keycloakEnabled) {
            return null;
        }
        return firstValueFrom(this.keycloak.me().pipe(catchError(() => of(null))));
    }
}
