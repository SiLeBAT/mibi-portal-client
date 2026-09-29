#!/usr/bin/env node
/*
 * Seeds the test accounts of the E2E stack.
 *
 * Why this exists and why the accounts are not in the seed dump: login is served by
 * the Parse class `users` (mibi-portal-server, schema/user.ts — className 'users'),
 * whose `password` field holds an **argon2** hash (user.entity.ts: argon2.hash /
 * argon2.verify). A restored production-like account would therefore come with an
 * unknown password, while the specs log in with the plaintext passwords in
 * cypress/fixtures/users.json. So the accounts are created here, deterministically,
 * and no password hash from a real database is ever shipped in the seed.
 *
 * The fixture encodes four states that the specs rely on — `enabled` is the
 * e-mail verification flag (User.isVerified) and `adminEnabled` the admin
 * activation flag (User.isActivated):
 *
 *   user1@test.com                          enabled + adminEnabled  → can log in
 *   not-admin-enabled@test.com              enabled, not activated
 *   not-enabled@test.com                    not verified, activated
 *   not-enabled-not-admin-enabled@test.com  neither
 *   newUser@test.com                        must NOT exist — the registration specs
 *                                           create it, so it is deleted here to keep
 *                                           those specs repeatable.
 *
 * Why the REST API and not a mongo insert: `users` is a Parse class, so Parse must
 * see the write (schema, pointer to `institutions`). Same reasoning as seed-states.js.
 *
 * Usage:
 *   PARSE_URL=http://localhost:1337/admin/parse \
 *   PARSE_APP_ID=appId PARSE_MASTER_KEY=masterKey \
 *   node e2e/seed/seed-users.js
 */

const fs = require('fs');
const path = require('path');

const PARSE_URL = process.env.PARSE_URL || 'http://localhost:1337/admin/parse';
const APP_ID = process.env.PARSE_APP_ID || 'appId';
const MASTER_KEY = process.env.PARSE_MASTER_KEY || 'masterKey';

const FIXTURE = path.join(__dirname, '..', '..', 'cypress', 'fixtures', 'users.json');

// The account the registration specs create; it must not be seeded.
const REGISTRATION_TARGET = 'newUser@test.com';

// argon2 hashes of the plaintext passwords in cypress/fixtures/users.json. They are
// precomputed so this script needs no native dependency (argon2 is a server-side
// package and is not installed in this repo). Test-only credentials — the plaintext
// sits in the fixture next to them.
//
// Regenerate after changing a fixture password, from a mibi-portal-server checkout
// with node_modules installed:
//   node -e "require('argon2').hash('<password>').then(console.log)"
const PASSWORD_HASHES = {
    'user1@test.com':
        '$argon2id$v=19$m=65536,t=3,p=4$SS1jXHai+5DIylhbLkx5Ow$nDgHRzYL7KbF03US4CgF/90/a3oO5WGcBWNLeU3PnhM',
    'not-admin-enabled@test.com':
        '$argon2id$v=19$m=65536,t=3,p=4$LQvqW0OquuUfDaj7uMqp3w$t64JRHjmMugcNPL1pHLcsJfLEi6Q2dhfge7dpznntOw',
    'not-enabled@test.com':
        '$argon2id$v=19$m=65536,t=3,p=4$hM5fqagLWGjffCZVtt4JxQ$i3Km3QXRQotJNWuSPUBp+Cs2rbxZfg/4HKCpqX5LBSs',
    'not-enabled-not-admin-enabled@test.com':
        '$argon2id$v=19$m=65536,t=3,p=4$hdTxfpPFn428X1ksufajSQ$Oh0+fZm7LhMG59DfVfnWN09nCvM6jCtHFOY9BN2XlD4'
};

const ACCOUNT_STATE = {
    'user1@test.com': { enabled: true, adminEnabled: true },
    'not-admin-enabled@test.com': { enabled: true, adminEnabled: false },
    'not-enabled@test.com': { enabled: false, adminEnabled: true },
    'not-enabled-not-admin-enabled@test.com': { enabled: false, adminEnabled: false }
};

const headers = {
    'X-Parse-Application-Id': APP_ID,
    'X-Parse-Master-Key': MASTER_KEY,
    'Content-Type': 'application/json'
};

async function parseRequest(method, resource, body) {
    const response = await fetch(`${PARSE_URL}${resource}`, {
        method: method,
        headers: headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(
            `${method} ${resource} failed: ${response.status} ${await response.text()}`
        );
    }
    return response.status === 204 ? undefined : await response.json();
}

async function findUser(email) {
    const where = encodeURIComponent(JSON.stringify({ email: email }));
    const body = await parseRequest('GET', `/classes/users?where=${where}`);
    return (body.results || [])[0];
}

// The institute the users belong to. It comes from the seed (export-seed.mongosh.js
// creates it with the fixed id E2EINST001) so the fixture can name it.
async function resolveInstitute(instituteId) {
    try {
        await parseRequest('GET', `/classes/institutions/${instituteId}`);
        return instituteId;
    } catch (error) {
        console.warn(
            `seed-users: institute ${instituteId} not found (${error.message.split('\n')[0]}).\n` +
                'seed-users: the seed data is probably missing — creating a stand-in ' +
                'institute instead. Specs that send the fixture instituteId (registration) ' +
                'will not match it.'
        );
        const created = await parseRequest('POST', '/classes/institutions', {
            name1: 'E2E Test-Institut (Ersatz)',
            state_short: 'BE',
            zip: '10589',
            city: 'Berlin',
            phone: '+49 30 0000000',
            email: ['e2e@example.invalid']
        });
        return created.objectId;
    }
}

function accountFor(fixtureUser, instituteId) {
    const state = ACCOUNT_STATE[fixtureUser.email];
    const hash = PASSWORD_HASHES[fixtureUser.email];
    if (!hash) {
        throw new Error(
            `no argon2 hash for ${fixtureUser.email} — add one (see the header of ` +
                'this file) or remove the user from the fixture.'
        );
    }
    return {
        email: fixtureUser.email,
        firstName: fixtureUser.firstName,
        lastName: fixtureUser.lastName,
        password: hash,
        enabled: state.enabled,
        adminEnabled: state.adminEnabled,
        numAttempt: 0,
        lastAttempt: Date.now(),
        legacySystem: false,
        institution: {
            __type: 'Pointer',
            className: 'institutions',
            objectId: instituteId
        }
    };
}

async function upsertUser(account) {
    const existing = await findUser(account.email);
    if (existing) {
        await parseRequest('PUT', `/classes/users/${existing.objectId}`, account);
        return 'updated';
    }
    await parseRequest('POST', '/classes/users', account);
    return 'created';
}

// ---------------------------------------------------------------------------
// Consent records (_User + User_Info).
//
// Login itself only needs the `users` class above, but the client opens the
// data-protection dialog for every user whose `dataSaveViewed` is false
// (data-consent.service.ts), and that dialog's backdrop swallows the first click of
// any spec that logs in. `dataSaveViewed`/`dataSaveAgreed` live on `User_Info`, which
// Parse finds through a `_User` looked up by username — so the seeded accounts get
// both rows, with consent already given. It also makes the consent and e-mail
// notification endpoints work instead of throwing "No _User found for …".
// ---------------------------------------------------------------------------

async function findParseUser(email) {
    const where = encodeURIComponent(JSON.stringify({ username: email }));
    const body = await parseRequest('GET', `/classes/_User?where=${where}`);
    return (body.results || [])[0];
}

async function upsertParseUser(fixtureUser) {
    const existing = await findParseUser(fixtureUser.email);
    if (existing) {
        return existing.objectId;
    }
    // POST /users is Parse's sign-up route; it hashes the password itself. This account
    // is not what the portal logs in with — it only anchors the User_Info row.
    const created = await parseRequest('POST', '/users', {
        username: fixtureUser.email,
        email: fixtureUser.email,
        password: fixtureUser.password
    });
    return created.objectId;
}

async function findUserInfo(parseUserId) {
    const where = encodeURIComponent(
        JSON.stringify({
            user: { __type: 'Pointer', className: '_User', objectId: parseUserId }
        })
    );
    const body = await parseRequest('GET', `/classes/User_Info?where=${where}`);
    return (body.results || [])[0];
}

async function upsertUserInfo(fixtureUser, parseUserId, instituteId) {
    const info = {
        user: { __type: 'Pointer', className: '_User', objectId: parseUserId },
        institute: {
            __type: 'Pointer',
            className: 'institutions',
            objectId: instituteId
        },
        firstName: fixtureUser.firstName,
        lastName: fixtureUser.lastName,
        dataSaveViewed: true,
        dataSaveAgreed: true,
        emailNotificationsEnabled: false,
        emailNotificationFrequency: 'daily',
        emailNotificationWeekday: 'monday',
        emailNotificationWeekOfMonth: '1'
    };
    const existing = await findUserInfo(parseUserId);
    if (existing) {
        await parseRequest('PUT', `/classes/User_Info/${existing.objectId}`, info);
        return;
    }
    await parseRequest('POST', '/classes/User_Info', info);
}

async function removeConsentRecords(email) {
    const parseUser = await findParseUser(email);
    if (!parseUser) {
        return false;
    }
    const info = await findUserInfo(parseUser.objectId);
    if (info) {
        await parseRequest('DELETE', `/classes/User_Info/${info.objectId}`);
    }
    await parseRequest('DELETE', `/users/${parseUser.objectId}`);
    return true;
}

async function removeUser(email) {
    const existing = await findUser(email);
    if (!existing) {
        return false;
    }
    await parseRequest('DELETE', `/classes/users/${existing.objectId}`);
    return true;
}

async function main() {
    const fixtureUsers = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
    const seeded = fixtureUsers.filter(user => user.email !== REGISTRATION_TARGET);

    const instituteIds = new Set(seeded.map(user => user.instituteId));
    if (instituteIds.size !== 1) {
        throw new Error(
            `the fixture users must share one instituteId, found: ${[...instituteIds].join(', ')}`
        );
    }
    const instituteId = await resolveInstitute([...instituteIds][0]);

    for (const fixtureUser of seeded) {
        const action = await upsertUser(accountFor(fixtureUser, instituteId));
        const parseUserId = await upsertParseUser(fixtureUser);
        await upsertUserInfo(fixtureUser, parseUserId, instituteId);
        console.log(`seed-users: ${action} ${fixtureUser.email} (consent given)`);
    }

    const removedAccount = await removeUser(REGISTRATION_TARGET);
    const removedConsent = await removeConsentRecords(REGISTRATION_TARGET);
    if (removedAccount || removedConsent) {
        console.log(
            `seed-users: removed ${REGISTRATION_TARGET} (the registration specs create it)`
        );
    }

    // Verify what the API actually returns, not what we think we wrote.
    for (const fixtureUser of seeded) {
        const stored = await findUser(fixtureUser.email);
        const expected = ACCOUNT_STATE[fixtureUser.email];
        if (!stored) {
            throw new Error(`${fixtureUser.email} is missing after seeding`);
        }
        if (
            stored.enabled !== expected.enabled ||
            stored.adminEnabled !== expected.adminEnabled
        ) {
            throw new Error(
                `${fixtureUser.email}: expected enabled=${expected.enabled} ` +
                    `adminEnabled=${expected.adminEnabled}, got enabled=${stored.enabled} ` +
                    `adminEnabled=${stored.adminEnabled}`
            );
        }
    }
    if (await findUser(REGISTRATION_TARGET)) {
        throw new Error(`${REGISTRATION_TARGET} must not exist after seeding`);
    }
    if (await findParseUser(REGISTRATION_TARGET)) {
        throw new Error(
            `${REGISTRATION_TARGET} still has a _User record after seeding`
        );
    }
    for (const fixtureUser of seeded) {
        const parseUser = await findParseUser(fixtureUser.email);
        const info = parseUser ? await findUserInfo(parseUser.objectId) : undefined;
        if (!info || info.dataSaveViewed !== true) {
            throw new Error(
                `${fixtureUser.email}: consent record missing or dataSaveViewed is not true`
            );
        }
    }

    console.log(
        `seed-users: ${seeded.length} accounts ready, institute ${instituteId}.`
    );
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
