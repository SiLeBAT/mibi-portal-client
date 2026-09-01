/**
 * Writes the client version into the build output as assets/version.json.
 *
 * The bundle is deployed into the server's public directory, so this file is
 * how the server learns which client release it serves (see the server's
 * client-version.ts). A browser tab that stays open across a release still runs
 * its original bundle; it compares the version baked into that bundle against
 * the deployed one and forces a reload when they differ.
 *
 * Runs as a post-build step of every build configuration. Failing here fails
 * the build on purpose: a bundle without a version file silently disables the
 * outdated-client check.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
// Matches "outputPath" in angular.json.
const outputDir = path.join(projectRoot, 'public');
const { version } = require(path.join(projectRoot, 'package.json'));

// `localize` emits one directory per locale; without it the bundle sits
// directly in the output directory.
function bundleDirectories(dir) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
        return [dir];
    }
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(dir, entry.name))
        .filter(candidate => fs.existsSync(path.join(candidate, 'index.html')));
}

if (!version) {
    console.error('package.json declares no version.');
    process.exit(1);
}

if (!fs.existsSync(outputDir)) {
    console.error(`No build output found at ${outputDir}.`);
    process.exit(1);
}

const bundles = bundleDirectories(outputDir);

if (bundles.length === 0) {
    console.error(`No bundle (index.html) found below ${outputDir}.`);
    process.exit(1);
}

bundles.forEach(bundle => {
    const assetsDir = path.join(bundle, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    const versionFile = path.join(assetsDir, 'version.json');
    fs.writeFileSync(
        versionFile,
        `${JSON.stringify({ version }, null, 2)}\n`,
        'utf-8'
    );
    console.log(`Wrote client version ${version} to ${versionFile}`);
});
