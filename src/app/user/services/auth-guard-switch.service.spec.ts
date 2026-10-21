import { RedirectCommand, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { AuthGuard } from './auth-guard.service';
import { AuthGuardSwitch } from './auth-guard-switch.service';
import { KeycloakAuthGuard } from './keycloak-auth.guard';

describe('AuthGuardSwitch', () => {
    const keycloakResult = new UrlTree();
    const legacyResult = new RedirectCommand(new UrlTree());
    let keycloakGuard: { canActivate: jest.Mock };
    let legacyGuard: { canActivate: jest.Mock };

    function guard(keycloakEnabled: boolean): AuthGuardSwitch {
        return new AuthGuardSwitch(
            keycloakEnabled,
            keycloakGuard as unknown as KeycloakAuthGuard,
            legacyGuard as unknown as AuthGuard
        );
    }

    beforeEach(() => {
        keycloakGuard = { canActivate: jest.fn().mockReturnValue(of(keycloakResult)) };
        legacyGuard = { canActivate: jest.fn().mockReturnValue(of(legacyResult)) };
    });

    it('delegates to the Keycloak guard when Keycloak is enabled', async () => {
        await expect(firstValueFrom(guard(true).canActivate())).resolves.toBe(keycloakResult);
        expect(legacyGuard.canActivate).not.toHaveBeenCalled();
    });

    it('delegates to the legacy guard when Keycloak is disabled', async () => {
        await expect(firstValueFrom(guard(false).canActivate())).resolves.toBe(legacyResult);
        expect(keycloakGuard.canActivate).not.toHaveBeenCalled();
    });
});
