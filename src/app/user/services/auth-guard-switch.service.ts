import { Inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthGuard } from './auth-guard.service';
import { KeycloakAuthGuard } from './keycloak-auth.guard';
import { KEYCLOAK_ENABLED } from './auth.tokens';

/**
 * Route guard that delegates to the Keycloak session guard or the legacy
 * JWT-in-store guard depending on the backend auth mode.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuardSwitch {
    constructor(
        @Inject(KEYCLOAK_ENABLED) private keycloakEnabled: boolean,
        private keycloakGuard: KeycloakAuthGuard,
        private legacyGuard: AuthGuard
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> {
        return this.keycloakEnabled
            ? this.keycloakGuard.canActivate()
            : this.legacyGuard.canActivate(route, state);
    }
}
