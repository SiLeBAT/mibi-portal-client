import moment from 'moment';
import { parseLastChange } from './last-change';

describe('parseLastChange', () => {
    it('reads the package.json format including its offset', () => {
        expect(parseLastChange('2019-04-16 11:25:17 +0200').toISOString())
            .toBe('2019-04-16T09:25:17.000Z');
    });

    it('reads ISO 8601', () => {
        expect(parseLastChange('2019-04-16T09:25:17.000Z').toISOString())
            .toBe('2019-04-16T09:25:17.000Z');
    });

    it('rejects the output of Date.prototype.toString', () => {
        const value = 'Tue Apr 16 2019 11:25:17 GMT+0200 (Central European Summer Time)';

        expect(parseLastChange(value).isValid()).toBe(false);
    });

    it('rejects a missing value', () => {
        expect(parseLastChange('').isValid()).toBe(false);
        expect(parseLastChange(null).isValid()).toBe(false);
    });

    it('orders two changes on the same day by their time', () => {
        const morning = parseLastChange('2026-09-14 08:00:00 +0200');
        const noon = parseLastChange('2026-09-14 12:00:00 +0200');

        expect(moment.max([noon, morning])).toBe(noon);
        expect(moment.max([morning, noon])).toBe(noon);
    });
});
