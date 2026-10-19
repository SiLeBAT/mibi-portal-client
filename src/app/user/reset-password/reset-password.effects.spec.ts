import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom, of, throwError } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { userResetPasswordSSA } from './reset-password.actions';
import { UserResetPasswordEffects } from './reset-password.effects';

const LOGIN_PATH = '/users/login';

interface NavigateAction extends Action {
    path: string;
}

describe('UserResetPasswordEffects', () => {
    let actions$: ReplaySubject<Action>;
    let resetPassword: jest.Mock;
    let logger: { error: jest.Mock };

    function effects(): UserResetPasswordEffects {
        return new UserResetPasswordEffects(
            actions$ as never,
            { resetPassword: resetPassword } as never,
            logger as never,
            { login: LOGIN_PATH } as never
        );
    }

    async function dispatched(count: number): Promise<Action[]> {
        const seen = firstValueFrom(effects().resetPassword$.pipe(take(count), toArray()));
        actions$.next(userResetPasswordSSA({ password: 'new-secret', token: 'token-1' }));
        return seen;
    }

    beforeEach(() => {
        actions$ = new ReplaySubject<Action>(1);
        resetPassword = jest.fn();
        logger = { error: jest.fn() };
    });

    describe('when the password is accepted', () => {
        beforeEach(() => {
            resetPassword.mockReturnValue(of({}));
        });

        it('sends the new password together with the token from the route', async () => {
            await dispatched(4);

            expect(resetPassword).toHaveBeenCalledWith('new-secret', 'token-1');
        });

        it('shows the busy spinner around the request', async () => {
            const result = await dispatched(4);

            expect(result[0]).toEqual(updateIsBusySOA({ isBusy: true }));
            expect(result[3]).toEqual(updateIsBusySOA({ isBusy: false }));
        });

        it('returns to the login page and confirms the change', async () => {
            const result = await dispatched(4);
            const navigate = result[1] as NavigateAction;

            expect(navigate.type).toBe(navigateMSA.type);
            expect(navigate.path).toBe(LOGIN_PATH);
            expect(result[2]).toEqual(showBannerSOA({ predefined: 'passwordChangeSuccess' }));
        });
    });

    describe('when the password is rejected', () => {
        beforeEach(() => {
            resetPassword.mockReturnValue(throwError(() => new Error('boom')));
        });

        it('reports the failure', async () => {
            const result = await dispatched(3);

            expect(result[1]).toEqual(showBannerSOA({ predefined: 'passwordChangeFailure' }));
        });

        it('stays on the page', async () => {
            const result = await dispatched(3);

            expect(result.map(action => action.type)).not.toContain(navigateMSA.type);
        });

        it('clears the busy spinner', async () => {
            const result = await dispatched(3);

            expect(result[2]).toEqual(updateIsBusySOA({ isBusy: false }));
        });

        it('logs the failure that the component used to swallow', async () => {
            await dispatched(3);

            expect(logger.error).toHaveBeenCalled();
        });
    });
});
