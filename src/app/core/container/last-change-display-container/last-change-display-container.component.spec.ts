import moment from 'moment';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { parseLastChange } from '../../model/last-change';
import { LastChangeDisplayContainerComponent } from './last-change-display-container.component';

const lastChangeShownFor = async (serverLastChange: string): Promise<moment.Moment> => {
    const component = new LastChangeDisplayContainerComponent(
        { dispatch: jest.fn() } as never,
        { getSystemInfo: () => of({ version: '1.0.0', lastChange: serverLastChange, supportContact: '' }) } as never
    );

    component.ngOnInit();
    // The server response is handled in a promise callback.
    await new Promise(resolve => setTimeout(resolve));

    return new Promise<moment.Moment>(resolve =>
        component.lastChangeObs.subscribe(value => resolve(value))
    );
};

describe('LastChangeDisplayContainerComponent', () => {
    it('reads the date in the format the server sends it', async () => {
        const shown = await lastChangeShownFor('2030-01-01 12:00:00 +0100');

        expect(shown.toISOString()).toBe('2030-01-01T11:00:00.000Z');
    });

    it('shows the client date when the server date is older', async () => {
        const shown = await lastChangeShownFor('2000-01-01 12:00:00 +0100');

        expect(shown.toISOString()).toBe(parseLastChange(environment.lastChange).toISOString());
    });

    it('shows the client date when the server date cannot be read', async () => {
        const shown = await lastChangeShownFor('Tue Jan 01 2030 12:00:00 GMT+0100 (Central European Standard Time)');

        expect(shown.toISOString()).toBe(parseLastChange(environment.lastChange).toISOString());
    });
});
