import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom, of, throwError } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { AlertType } from '../../core/model/alert.model';
import { updateIsBusySOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { userRecoverPasswordSSA } from './recover-password.actions';
import { UserRecoverPasswordEffects } from './recover-password.effects';

const SUPPORT = 'support@example.org';
const LOGIN_PATH = '/users/login';

interface BannerAction extends Action {
    banner: { message: string; type: AlertType };
}

interface NavigateAction extends Action {
    path: string;
}

describe('UserRecoverPasswordEffects', () => {
    let actions$: ReplaySubject<Action>;
    let resetPasswordRequest: jest.Mock;
    let logger: { error: jest.Mock };

    function effects(): UserRecoverPasswordEffects {
        return new UserRecoverPasswordEffects(
            actions$ as never,
            { select: () => of(SUPPORT) } as never,
            { resetPasswordRequest: resetPasswordRequest } as never,
            { getConfigOfType: () => ({ label: 'OK' }) } as never,
            logger as never,
            { login: LOGIN_PATH } as never
        );
    }

    /** Everything the effect dispatches for one request, in order. */
    async function dispatched(count: number): Promise<Action[]> {
        const seen = firstValueFrom(effects().recoverPassword$.pipe(take(count), toArray()));
        actions$.next(userRecoverPasswordSSA({ email: 'user@example.org' }));
        return seen;
    }

    beforeEach(() => {
        actions$ = new ReplaySubject<Action>(1);
        resetPasswordRequest = jest.fn();
        logger = { error: jest.fn() };
    });

    describe('when the request succeeds', () => {
        beforeEach(() => {
            resetPasswordRequest.mockReturnValue(
                of({ passwordResetRequest: true, email: 'user@example.org' })
            );
        });

        it('calls the api with the address it was given', async () => {
            await dispatched(4);

            expect(resetPasswordRequest).toHaveBeenCalledWith('user@example.org');
        });

        it('shows the busy spinner around the request', async () => {
            const result = await dispatched(4);

            expect(result[0]).toEqual(updateIsBusySOA({ isBusy: true }));
            expect(result[3]).toEqual(updateIsBusySOA({ isBusy: false }));
        });

        it('returns to the login page', async () => {
            const result = await dispatched(4);
            const navigate = result[1] as NavigateAction;

            expect(navigate.type).toBe(navigateMSA.type);
            expect(navigate.path).toBe(LOGIN_PATH);
        });

        it('reports success with the address the server confirmed', async () => {
            const result = await dispatched(4);
            const banner = result[2] as BannerAction;

            expect(banner.banner.type).toBe(AlertType.SUCCESS);
            expect(banner.banner.message).toBe(
                'Eine E-mail mit weiteren Anweisungen wurde an user@example.org gesendet. '
                + 'Wenn Sie keine E-mail erhalten, könnte das bedeuten, daß Sie sich mit '
                + 'einer anderen E-mail-Adresse angemeldet haben.'
            );
        });
    });

    describe('when the request fails', () => {
        beforeEach(() => {
            resetPasswordRequest.mockReturnValue(throwError(() => new Error('boom')));
        });

        it('explains the failure and names the support address', async () => {
            const result = await dispatched(3);
            const banner = result[1] as BannerAction;

            expect(banner.banner.type).toBe(AlertType.ERROR);
            expect(banner.banner.message).toBe(
                'Fehler beim Passwort-Zurücksetzen. Eine E-mail mit weiteren Informationen '
                + 'wurde an user@example.org gesendet. Wenn Sie keine E-mail erhalten, wenden '
                + `Sie sich bitte direkt per E-mail an uns: ${SUPPORT}.`
            );
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
