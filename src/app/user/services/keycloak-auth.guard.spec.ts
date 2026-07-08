import { Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MeResponse } from '../model/auth.model';
import { KeycloakAuthService } from './keycloak-auth.service';
import { KeycloakAuthGuard } from './keycloak-auth.guard';

const meResponse: MeResponse = {
    sub: 'u1',
    email: 'a@b.com',
    preferred_username: 'user1',
    dataSaveAgreed: false,
    dataSaveViewed: false,
    emailNotificationSettings: {
        enabled: false,
        frequency: 'daily',
        weekday: 'monday',
        weekOfMonth: '1'
    }
};

function makeGuard(
    me: jest.Mock,
    createUrlTree = jest.fn()
): KeycloakAuthGuard {
    const authService = { me: me } as unknown as KeycloakAuthService;
    const router = { createUrlTree: createUrlTree } as unknown as Router;
    return new KeycloakAuthGuard(authService, router);
}

describe('KeycloakAuthGuard', () => {
    describe('canActivate()', () => {
        it('returns true when session is active', async () => {
            const guard = makeGuard(jest.fn().mockReturnValue(of(meResponse)));

            const result = await guard.canActivate().toPromise();

            expect(result).toBe(true);
        });

        it('returns login UrlTree when session is not active', async () => {
            const loginUrlTree = {} as UrlTree;
            const createUrlTree = jest.fn().mockReturnValue(loginUrlTree);
            const guard = makeGuard(
                jest.fn().mockReturnValue(throwError(new Error('401'))),
                createUrlTree
            );

            const result = await guard.canActivate().toPromise();

            expect(result).toBe(loginUrlTree);
            expect(createUrlTree).toHaveBeenCalledWith(['/users/login']);
        });
    });
});
