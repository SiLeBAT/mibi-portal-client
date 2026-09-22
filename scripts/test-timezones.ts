/**
 * Runs the test suite once per timezone.
 *
 * The Excel parser reads the dates a sample sheet carries, and those bugs were
 * invisible in German time: a date cell came back shifted by the browser's
 * offset, which moves the day itself for a browser west of UTC. The suite
 * therefore has to run outside Berlin as well.
 *
 *   npm run test:timezones            # all three timezones
 *   npm run test:timezones -- <args>  # extra arguments are passed to jest
 *
 * Before each run the script checks that Node really uses the timezone. A
 * value Node does not understand is ignored without a word, and the run would
 * then prove nothing. Typing `TZ=America/New_York npx jest` in Git Bash is such
 * a case - Git Bash rewrites values containing "/" before Node sees them - so
 * use this script instead.
 */
import { spawnSync } from 'child_process';

const TIMEZONES = ['UTC', 'Europe/Berlin', 'America/New_York'];

// One winter and one summer moment, so summer time is checked as well.
const PROBE_DATES = ['2026-01-15T12:00:00Z', '2026-07-15T12:00:00Z'];

const jestBin = require.resolve('jest/bin/jest');
const jestArgs = ['--runInBand', ...process.argv.slice(2)];

// The UTC offsets Node uses when it is started with TZ set to the zone.
function offsetsNodeUses(timeZone: string): string {
    const code =
        `const dates = ${JSON.stringify(PROBE_DATES)};` +
        'process.stdout.write(JSON.stringify(' +
        'dates.map(date => -new Date(date).getTimezoneOffset())));';
    const probe = spawnSync(process.execPath, ['-e', code], {
        env: { ...process.env, TZ: timeZone },
        encoding: 'utf8'
    });
    return probe.stdout || 'nothing';
}

// The UTC offsets the zone really has, taken from the timezone database.
function offsetsOf(timeZone: string): string {
    const format = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        timeZoneName: 'longOffset'
    });
    const offsets = PROBE_DATES.map(date => {
        const name =
            format
                .formatToParts(new Date(date))
                .find(part => part.type === 'timeZoneName')?.value ?? '';
        const match = /GMT([+-])(\d\d):(\d\d)/.exec(name);
        if (!match) {
            return 0;
        }
        const minutes = Number(match[2]) * 60 + Number(match[3]);
        return match[1] === '-' ? -minutes : minutes;
    });
    return JSON.stringify(offsets);
}

function main(): void {
    let failed: string | null = null;

    for (const timeZone of TIMEZONES) {
        const expected = offsetsOf(timeZone);
        const used = offsetsNodeUses(timeZone);

        console.log(`\n=== ${timeZone} === (UTC offset winter/summer: ${expected} minutes)\n`);

        if (used !== expected) {
            console.log(
                `Node does not apply TZ=${timeZone} on this machine: it uses ` +
                    `${used} instead of ${expected}. Stopping, because the run ` +
                    'would prove nothing.'
            );
            process.exit(1);
        }

        const run = spawnSync(process.execPath, [jestBin, ...jestArgs], {
            env: { ...process.env, TZ: timeZone },
            stdio: 'inherit'
        });

        if (run.status !== 0) {
            failed = failed ?? timeZone;
            console.log(`\n!!! tests failed in ${timeZone}\n`);
        }
    }

    if (failed) {
        console.log(`\nTimezone run failed, first in ${failed}.`);
        process.exit(1);
    }

    console.log('\nAll timezones passed.');
}

main();
