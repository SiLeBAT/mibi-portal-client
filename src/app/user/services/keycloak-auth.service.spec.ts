import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { MeResponse } from '../model/auth.model';
import {
    userDestroyCurrentUserSOA,
    userUpdateCurrentUserSOA
} from '../state/user.actions';
import { KeycloakAuthService } from './keycloak-auth.service';

const meResponse: MeResponse = { sub: 'u1', email: 'a@b.com', preferred_username: 'user1' };

function makeService(
    get = jest.fn(),
    post = jest.fn(),
    dispatch = jest.fn()
): { service: KeycloakAuthService; dispatch: jest.Mock; navigateTo: jest.SpyInstance } {
    const http = { get: get, post: post } as unknown as HttpClient;
    const store = { dispatch: dispatch } as unknown as Store;
    const service = new KeycloakAuthService(http, store);
    const navigateTo = jest.spyOn(service as any, 'navigateTo').mockImplementation(() => {});
    return { service: service, dispatch: dispatch, navigateTo: navigateTo };
}

describe('KeycloakAuthService', () => {

    describe('me()', () => {
        it('returns MeResponse when server responds 200', async () => {
            const get = jest.fn().mockReturnValue(of(meResponse));
            const { service } = makeService(get);

            const result = await service.me().toPromise();

            expect(result).toEqual(meResponse);
            expect(get).toHaveBeenCalledWith('/v2/auth/me');
        });

        it('dispatches userUpdateCurrentUserSOA on success', async () => {
            const get = jest.fn().mockReturnValue(of(meResponse));
            const { service, dispatch } = makeService(get);

            await service.me().toPromise();

            expect(dispatch).toHaveBeenCalledWith(
                userUpdateCurrentUserSOA({
                    user: {
                        email: 'a@b.com',
                        firstName: 'user1',
                        lastName: '',
                        instituteId: '',
                        token: ''
                    }
                })
            );
        });

        it('propagates error when server responds 401', async () => {
            const error = new Error('Unauthorized');
            const get = jest.fn().mockReturnValue(throwError(error));
            const { service } = makeService(get);

            await expect(service.me().toPromise()).rejects.toBe(error);
        });
    });

    describe('logout()', () => {

        it('POSTs to /v2/auth/logout', async () => {
            const post = jest.fn().mockReturnValue(of({ endSessionUrl: 'https://kc/logout' }));
            const { service } = makeService(jest.fn(), post);

            await service.logout().toPromise();

            expect(post).toHaveBeenCalledWith('/v2/auth/logout', {});
        });

        it('navigates to endSessionUrl returned by server', async () => {
            const endSessionUrl = 'https://kc/logout?redirect=app';
            const post = jest.fn().mockReturnValue(of({ endSessionUrl: endSessionUrl }));
            const { service, navigateTo } = makeService(jest.fn(), post);

            await service.logout().toPromise();

            expect(navigateTo).toHaveBeenCalledWith(endSessionUrl);
        });

        it('dispatches userDestroyCurrentUserSOA on success', async () => {
            const post = jest.fn().mockReturnValue(of({ endSessionUrl: '' }));
            const { service, dispatch } = makeService(jest.fn(), post);

            await service.logout().toPromise();

            expect(dispatch).toHaveBeenCalledWith(userDestroyCurrentUserSOA());
        });
    });

    describe('currentUser$', () => {
        it('emits null before any interaction', async () => {
            const { service } = makeService();

            const current = await service.currentUser$.pipe(take(1)).toPromise();

            expect(current).toBeNull();
        });

        it('emits MeResponse after me() resolves', async () => {
            const get = jest.fn().mockReturnValue(of(meResponse));
            const { service } = makeService(get);

            await service.me().toPromise();
            const current = await service.currentUser$.pipe(take(1)).toPromise();

            expect(current).toEqual(meResponse);
        });

        it('emits null after logout() completes', async () => {
            const get = jest.fn().mockReturnValue(of(meResponse));
            const post = jest.fn().mockReturnValue(of({ endSessionUrl: '' }));
            const { service } = makeService(get, post);

            await service.me().toPromise();
            await service.logout().toPromise();
            const current = await service.currentUser$.pipe(take(1)).toPromise();

            expect(current).toBeNull();
        });
    });
});
