import moment from 'moment';

// The server serves the date of last change straight from its package.json
// ("2019-04-16 11:25:17 +0200"). ISO 8601 is accepted as well, so the client
// keeps working once the date is sent in the standard format.
const LAST_CHANGE_FORMATS = [moment.ISO_8601, 'YYYY-MM-DD HH:mm:ss ZZ'];

export function parseLastChange(value: string | null | undefined): moment.Moment {
    if (!value) {
        return moment.invalid();
    }
    return moment(value, LAST_CHANGE_FORMATS, true);
}
