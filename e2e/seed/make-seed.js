#!/usr/bin/env node
/*
 * Creates the E2E seed file from a local MiBi-Portal database.
 *
 * Usage:
 *   node e2e/seed/make-seed.js [--uri <mongodb uri>] [--out <file>]
 *                             [--files <dir>] [--keep-plain]
 *
 * Defaults: --uri   mongodb://localhost:27017/mibiportal
 *           --out   e2e/seed/seed-data.js.gz
 *           --files ../mibi-portal-server/data   (the Parse file store)
 *
 * Two things are copied, because the data lives in two places:
 *   1. the Mongo documents  -> seed-data.js.gz
 *   2. Parse File contents  -> e2e/seed/files/
 * Parse stores file *contents* on the server's filesystem (@parse/fs-files-adapter),
 * not in Mongo, so the Excel templates that `Template_File` rows point at would be
 * missing from a database-only seed — and submission/Excel creation then fails with
 * "No Excel data available.". docker-compose.yml mounts e2e/seed/files into the
 * server container as its data directory.
 *
 * It runs e2e/seed/export-seed.mongosh.js with mongosh, gzips the printed seed and
 * writes it next to this script. The result is what the E2E stack restores on first
 * boot (see e2e/mongo/restore.sh). It is committed, so CI and a fresh clone need nothing
 * else; re-run the person-name check in e2e/README.md before committing a refreshed seed.
 *
 * Only mongosh is required; mongodump/mongorestore are deliberately not used, so
 * neither this machine nor the mongo container needs mongodb-database-tools.
 *
 * --keep-plain additionally writes the ungzipped seed-data.js, which is worth doing
 * once when reviewing what the seed contains.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DEFAULT_URI = 'mongodb://localhost:27017/mibiportal';
const EXPORT_SCRIPT = path.join(__dirname, 'export-seed.mongosh.js');
// Sibling checkout: <workspace>/mibi-portal-server/data (dataStore.dataDir in its config).
const DEFAULT_FILE_STORE = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'mibi-portal-server',
    'data'
);
const FILES_OUT = path.join(__dirname, 'files');

function parseArgs(argv) {
    const args = {
        uri: DEFAULT_URI,
        out: path.join(__dirname, 'seed-data.js.gz'),
        files: DEFAULT_FILE_STORE,
        keepPlain: false
    };
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case '--uri':
                args.uri = argv[++i];
                break;
            case '--out':
                args.out = path.resolve(argv[++i]);
                break;
            case '--files':
                args.files = path.resolve(argv[++i]);
                break;
            case '--keep-plain':
                args.keepPlain = true;
                break;
            default:
                throw new Error(`unknown argument: ${argv[i]}`);
        }
    }
    return args;
}

function runExport(uri) {
    const result = spawnSync(
        'mongosh',
        ['--quiet', uri, '--file', EXPORT_SCRIPT],
        { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 }
    );

    if (result.error && result.error.code === 'ENOENT') {
        throw new Error(
            'mongosh was not found on the PATH. Install the MongoDB Shell, or add it ' +
                'to the PATH, and run this script again.'
        );
    }
    if (result.status !== 0) {
        throw new Error(
            `mongosh exited with ${result.status}:\n${result.stderr || result.stdout}`
        );
    }
    if (result.stderr && result.stderr.trim()) {
        // mongosh writes connection warnings to stderr; keep them visible but do not fail.
        console.warn(result.stderr.trim());
    }
    return result.stdout;
}

/*
 * `states` comes from the checked-in states.json, not from the development database.
 *
 * Two reasons. The AVV id format rule (validation error 72) and the MPC-291 year check
 * (error 127) read their regexes from this collection, and a development copy can be
 * stale: Hessen still carries the year-agnostic `^[0-9]{9}$` there instead of
 * `^yy[0-9]{7}$`, which makes the year check silently pass everything. And it must be in
 * the seed rather than inserted by seed-states.js afterwards, because the cloud reads the
 * regexes once while starting up — rows added later leave both rules inert.
 *
 * Ids are fixed so a restore is reproducible; Parse objectIds are plain strings.
 */
function statesSection() {
    const states = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8')
    );
    const now = new Date().toISOString();
    const docs = states.map((state, index) => ({
        _id: `E2ESTATE${String(index + 1).padStart(2, '0')}`,
        short: state.short,
        name: state.name,
        AVV: state.AVV || [],
        _created_at: { $date: now },
        _updated_at: { $date: now }
    }));

    return [
        '',
        `// ---- states (${docs.length} documents, from e2e/seed/states.json) ----`,
        'target.getCollection("states").deleteMany({});',
        'target.getCollection("states").insertMany(EJSON.parse(' +
            JSON.stringify(JSON.stringify(docs)) +
            '));',
        ''
    ].join('\n');
}

// Parse File contents. Only files a Template_File / Zomo_Plan_File row points at are of
// interest, but the store holds nothing else, so it is copied as a whole.
function copyFileStore(sourceDir) {
    if (!fs.existsSync(sourceDir)) {
        console.warn(
            `make-seed: no Parse file store at ${sourceDir} — skipping. Excel/submission ` +
                'creation will fail in the E2E stack ("No Excel data available."). Pass ' +
                '--files <dir> if the store lives elsewhere.'
        );
        return 0;
    }

    fs.mkdirSync(FILES_OUT, { recursive: true });
    const entries = fs
        .readdirSync(sourceDir, { withFileTypes: true })
        .filter(entry => entry.isFile());

    for (const entry of entries) {
        fs.copyFileSync(
            path.join(sourceDir, entry.name),
            path.join(FILES_OUT, entry.name)
        );
    }
    return entries.length;
}

function main() {
    const args = parseArgs(process.argv.slice(2));

    console.log(`make-seed: reading ${args.uri} ...`);
    const exported = runExport(args.uri);

    if (!exported.includes('getSiblingDB')) {
        throw new Error(
            'the export produced no seed statements — is the URI pointing at a ' +
                'MiBi-Portal database?'
        );
    }

    // The canonical states go in last, after the export's own wipe of the collection.
    const seed = exported + statesSection();

    if (args.keepPlain) {
        const plain = args.out.replace(/\.gz$/, '');
        fs.writeFileSync(plain, seed);
        console.log(
            `make-seed: wrote ${path.basename(plain)} ` +
                `(${(seed.length / 1024 / 1024).toFixed(1)} MB, review it before sharing)`
        );
    }

    const gzipped = zlib.gzipSync(Buffer.from(seed, 'utf8'), { level: 9 });
    fs.writeFileSync(args.out, gzipped);
    console.log(
        `make-seed: wrote ${path.basename(args.out)} ` +
            `(${(gzipped.length / 1024 / 1024).toFixed(1)} MB)`
    );
    const copied = copyFileStore(args.files);
    if (copied > 0) {
        console.log(
            `make-seed: copied ${copied} Parse file(s) to ` +
                `${path.relative(process.cwd(), FILES_OUT)} (Excel templates etc.)`
        );
    }

    console.log(
        'make-seed: seed-data.js.gz and files/ are committed — re-run the person-name ' +
            'check in e2e/README.md before committing a refreshed seed.'
    );
}

try {
    main();
} catch (error) {
    console.error(`make-seed: ${error.message}`);
    process.exit(1);
}
