/*
 * Builds the E2E seed from a local MiBi-Portal database.
 *
 * This is a mongosh script: it READS a development database and PRINTS another
 * mongosh script (the seed) to stdout. Run it through the wrapper, which also
 * gzips the result:
 *
 *   node e2e/seed/make-seed.js
 *
 * Direct use (same thing, without gzip):
 *
 *   mongosh --quiet "mongodb://localhost:27017/mibiportal" \
 *       --file e2e/seed/export-seed.mongosh.js > e2e/seed/seed-data.js
 *
 * Why a mongosh script and not `mongodump`:
 *   - the `mongo:6` image used by e2e/docker-compose.yml ships mongosh but NOT
 *     mongorestore (mongodb-database-tools is a separate package), and the init
 *     hook in /docker-entrypoint-initdb.d can run .js files with mongosh directly;
 *   - a development machine then needs nothing but mongosh either.
 * The output is plain text, so the seed can be reviewed in a diff before it is
 * handed to CI — which matters, because the source database holds real data.
 *
 * WHAT IS EXPORTED: reference/master data only (catalogues, NRL, postcodes,
 * validation errors, Parse schemas) plus `institutions` with the contact fields
 * overwritten. No accounts, orders, samples or results are ever read — see
 * WIPE_COLLECTIONS below, which the seed actively empties. Test accounts are
 * created separately by seed-users.js, so no password hash from a real database
 * can end up in the seed.
 */

const TARGET_DB = 'mibiportal';

// Batch size for insertMany: some AVV_Catalog documents are ~0.5 MB, so batch by
// serialized size instead of document count to stay well under the 16 MB BSON limit.
const MAX_BATCH_BYTES = 4 * 1024 * 1024;

// The institute the E2E test users belong to. Its _id is fixed (Parse objectIds are
// plain strings) so cypress/fixtures/users.json can reference it, which a
// Parse-generated id would not allow.
const E2E_INSTITUTE_ID = 'E2EINST001';

// Reference data: no personal data, copied as-is.
const REFERENCE_COLLECTIONS = [
    'AVV_Catalog',
    'Additional_Pathogens',
    'Allowed_PLZ',
    'Analysis_Procedure',
    'analysisprocedures',
    'NRL',
    'Search_Alias',
    'validationerrors',
    'Zomo_Plan',
    'Zomo_Plan_File',
    'Template_File',
    'Client_Dashboard',
    'dbversioninfos',
    '_SCHEMA',
    '_GlobalConfig',
    'fs.files',
    'fs.chunks'
];

// Emptied by the seed. For the account and submission collections that keeps real data
// out when restoring over a non-empty database; none of them is ever read by this script.
//
// `states` is wiped for a different reason: make-seed.js appends it to the seed from the
// checked-in states.json instead of copying it from here, because a development copy can
// be stale — Hessen in the development database still carries the year-agnostic
// `^[0-9]{9}$` instead of `^yy[0-9]{7}$`, which silently disables the MPC-291 year check
// (validation error 127). It has to be part of the seed rather than seeded afterwards:
// the cloud reads the state regexes once at startup, so rows inserted after the server
// is up leave the rule inert.
const WIPE_COLLECTIONS = [
    'users',
    '_User',
    'User_Info',
    '_Session',
    'Order',
    'Sample',
    'Result',
    'resettokens',
    'states'
];

function literal(value) {
    // JSON.stringify produces a correctly escaped JS string literal, so arbitrary
    // catalogue text cannot break out of the generated code.
    return JSON.stringify(EJSON.stringify(value, { relaxed: false }));
}

function emitInserts(name, docs) {
    print('');
    print(`// ---- ${name} (${docs.length} documents) ----`);
    print(`target.getCollection(${JSON.stringify(name)}).deleteMany({});`);

    let batch = [];
    let bytes = 0;
    const flush = () => {
        if (batch.length === 0) {
            return;
        }
        print(
            `target.getCollection(${JSON.stringify(name)}).insertMany(` +
                `EJSON.parse(${literal(batch)}));`
        );
        batch = [];
        bytes = 0;
    };

    for (const doc of docs) {
        const size = EJSON.stringify(doc, { relaxed: false }).length;
        if (bytes + size > MAX_BATCH_BYTES) {
            flush();
        }
        batch.push(doc);
        bytes += size;
    }
    flush();
}

// `email` is an array and `address1`/`address2` are objects in this class — see the
// institutions entry in _SCHEMA. Names, city, zip and state_short are kept: they are
// public information about laboratories, and the PLZ/state values are what the UI and
// the AVV format rules work with.
function scrubInstitution(doc, index) {
    const scrubbed = Object.assign({}, doc);
    scrubbed.email = [`institut${index + 1}@example.invalid`];
    if ('phone' in scrubbed) {
        scrubbed.phone = '+49 30 0000000';
    }
    if ('fax' in scrubbed) {
        scrubbed.fax = '+49 30 0000001';
    }
    return scrubbed;
}

function e2eInstitute() {
    const now = new Date();
    return {
        _id: E2E_INSTITUTE_ID,
        name1: 'E2E Test-Institut',
        name2: 'Automatisierte Tests',
        zip: '10589',
        city: 'Berlin',
        state_short: 'BE',
        phone: '+49 30 0000000',
        fax: '+49 30 0000001',
        email: ['e2e@example.invalid'],
        address1: { street: 'Teststraße 1', city: 'Berlin' },
        _created_at: now,
        _updated_at: now
    };
}

print('// GENERATED by e2e/seed/export-seed.mongosh.js — do not edit by hand.');
print(`// Source database: ${db.getName()}`);
print(`// Created: ${new Date().toISOString()}`);
print('//');
print('// Reference data + scrubbed institutions for the MiBi-Portal E2E stack.');
print('// Test accounts are NOT part of this file; see e2e/seed/seed-users.js.');
print('');
print(`const target = db.getSiblingDB(${JSON.stringify(TARGET_DB)});`);

print('');
print('// Personal data must not survive a restore into a non-empty database.');
for (const name of WIPE_COLLECTIONS) {
    print(`target.getCollection(${JSON.stringify(name)}).deleteMany({});`);
}

for (const name of REFERENCE_COLLECTIONS) {
    const docs = db.getCollection(name).find({}).toArray();
    if (docs.length === 0) {
        print('');
        print(`// ---- ${name}: empty in the source database, skipped ----`);
        continue;
    }
    emitInserts(name, docs);
}

const institutions = db
    .getCollection('institutions')
    .find({})
    .toArray()
    .map(scrubInstitution);
institutions.push(e2eInstitute());
emitInserts('institutions', institutions);

print('');
print("print('seed-data: restore complete.');");
