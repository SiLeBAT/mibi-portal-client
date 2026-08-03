#!/usr/bin/env node
/*
 * Seeds the `states` Parse class of the e2e stack.
 *
 * Why this exists: the AVV sample-id format rule (validation error 72) gets its
 * regexes from this collection at runtime — `AVVFormatProvider` reads it via
 * `StateRepository`, and `validation-constraints.ts` ships an EMPTY regex list.
 * `matchesRegexPattern` treats an empty list as "nothing to check", so without this
 * seed the state-regex tests pass without testing anything.
 *
 * Why the REST API and not a mongo insert: `states` is a Parse class, so it needs a
 * `_SCHEMA` entry as well as documents. Creating the objects through Parse with the
 * master key makes Parse Server build the schema itself, instead of us hand-writing
 * its internal representation.
 *
 * Data source: master-data/data/db/states/states.json (BfR-internal GitLab, not
 * reachable from a GitHub Actions runner — hence the checked-in copy in states.json).
 * Refresh it when the states master data changes.
 *
 * Usage:
 *   PARSE_URL=http://localhost:1337/admin/parse \
 *   PARSE_APP_ID=appId PARSE_MASTER_KEY=masterKey \
 *   node e2e/seed/seed-states.js
 */

const fs = require('fs');
const path = require('path');

const PARSE_URL = process.env.PARSE_URL || 'http://localhost:1337/admin/parse';
const APP_ID = process.env.PARSE_APP_ID || 'appId';
const MASTER_KEY = process.env.PARSE_MASTER_KEY || 'masterKey';

const headers = {
    'X-Parse-Application-Id': APP_ID,
    'X-Parse-Master-Key': MASTER_KEY,
    'Content-Type': 'application/json'
};

async function existingCount() {
    const url = `${PARSE_URL}/classes/states?limit=0&count=1`;
    const response = await fetch(url, { headers: headers });
    if (!response.ok) {
        // A class that does not exist yet is not an error — it just has no rows.
        return 0;
    }
    const body = await response.json();
    return body.count || 0;
}

async function createState(state) {
    const response = await fetch(`${PARSE_URL}/classes/states`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            short: state.short,
            name: state.name,
            AVV: state.AVV || []
        })
    });
    if (!response.ok) {
        throw new Error(
            `failed to create state ${state.short}: ` +
                `${response.status} ${await response.text()}`
        );
    }
}

async function main() {
    const states = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8')
    );

    const already = await existingCount();
    if (already > 0) {
        console.log(
            `seed-states: ${already} states already present — nothing to do.`
        );
        return;
    }

    for (const state of states) {
        await createState(state);
    }

    const seeded = await existingCount();
    if (seeded !== states.length) {
        throw new Error(
            `seed-states: expected ${states.length} states, found ${seeded}`
        );
    }
    console.log(`seed-states: seeded ${seeded} states.`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
