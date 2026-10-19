import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom, of, throwError } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { AlertType } from '../../core/model/alert.model';
import { updateIsBusySOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { RegistrationDetails } from '../model/user.model';
import { userRegisterSSA } from './register.actions';
import { UserRegisterEffects } from './register.effects';

const SUPPORT = 'support@example.org';
const LOGIN_PATH = '/users/login';

const details: RegistrationDetails = {
    email: 'user@example.org',
    password: 'secret',
    firstName: 'Ada',
    lastName: 'Lovelace',
    instituteId: 'institute-1'
};

interface BannerAction extends Action {
    banner: { message: string; type: AlertType };
}

interface NavigateAction extends Action {
    path: string;
}

describe('UserRegisterEffects', () => {
    let actions$: ReplaySubject<Action>;
    let registrationRequest: jest.Mock;
    let logger: { error: jest.Mock };

    function effects(): UserRegisterEffects {
        return new UserRegisterEffects(
            actions$ as never,
            { select: () => of(SUPPORT) } as never,
            { registrationRequest: registrationRequest } as never,
            { getConfigOfType: () => ({ label: 'OK' }) } as never,
            logger as never,
            { login: LOGIN_PATH } as never
        );
    }

    async function dispatched(count: number): Promise<Action[]> {
        const seen = firstValueFrom(effects().register$.pipe(take(count), toArray()));
        actions$.next(userRegisterSSA({ details: details }));
        return seen;
    }

    beforeEach(() => {
        actions$ = new ReplaySubject<Action>(1);
        registrationRequest = jest.fn();
        logger = { error: jest.fn() };
    });

    describe('when registration succeeds', () => {
        beforeEach(() => {
            registrationRequest.mockReturnValue(
                of({ registerRequest: true, email: 'user@example.org' })
            );
        });

        it('sends exactly the registration fields the api expects', async () => {
            await dispatched(4);

            expect(registrationRequest).toHaveBeenCalledWith({
                email: 'user@example.org',
                password: 'secret',
                firstName: 'Ada',
                lastName: 'Lovelace',
                instituteId: 'institute-1'
            });
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

        it('asks the user to confirm the address the server reported', async () => {
            const result = await dispatched(4);
            const banner = result[2] as BannerAction;

            expect(banner.banner.type).toBe(AlertType.SUCCESS);
            expect(banner.banner.message).toBe(
                'Bitte bestätigen Sie Ihre E-Mail-Adresse: Eine E-mail mit weiteren '
                + 'Anweisungen wurde an user@example.org gesendet'
            );
        });
    });

    describe('when registration fails', () => {
        beforeEach(() => {
            registrationRequest.mockReturnValue(throwError(() => new Error('boom')));
        });

        it('explains the failure and names the support address', async () => {
            const result = await dispatched(3);
            const banner = result[1] as BannerAction;

            expect(banner.banner.type).toBe(AlertType.ERROR);
            expect(banner.banner.message).toBe(
                'Fehler beim Registrieren. Eine E-mail mit weiteren Informationen wurde an '
                + 'user@example.org gesendet. Wenn Sie keine E-mail erhalten, wenden Sie sich '
                + `bitte direkt per E-mail an uns: ${SUPPORT}.`
            );
        });

        it('stays on the registration page', async () => {
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
