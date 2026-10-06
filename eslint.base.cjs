/* eslint-env node */
/**
 * MiBi common ESLint rule set.
 *
 * This file is intentionally IDENTICAL in mibi-portal-client, mibi-portal-server
 * and mibi-parse-cloud. When a rule changes here, copy the file to the other two
 * repositories in the same change. App-specific rules belong in the repository's
 * own .eslintrc, not in this file.
 *
 * The type-aware rules below require `parserOptions.project` and
 * `strictNullChecks` (enabled via `strict`) in the consuming repository.
 */
module.exports = {
    plugins: ['@typescript-eslint', 'sonarjs'],
    rules: {
        // No unnecessary try/catch blocks (e.g. the error is only rethrown).
        'no-useless-catch': 'error',

        // Correct use of try/catch in async code paths: a promise must be
        // awaited inside the `try` for the `catch` to ever see its rejection.
        '@typescript-eslint/return-await': ['error', 'in-try-catch'],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/require-await': 'error',
        'no-async-promise-executor': 'error',
        'no-unsafe-finally': 'error',

        // Null checks are valid for all code paths: flags conditions that can
        // never be false (and never-null operands of `?.` / `??` / `!`).
        //
        // Reported as a warning, not an error. Without the tsconfig flag
        // `noUncheckedIndexedAccess`, TypeScript types every index-signature
        // lookup as present, so this rule also reports guards that are
        // genuinely needed -- `changes.model` in ngOnChanges (Angular only
        // populates inputs that actually changed) and plain record lookups.
        // Those guards are deliberately kept. Enabling
        // `noUncheckedIndexedAccess` would make all of them valid and let this
        // rule move to 'error'; it costs ~106 further type fixes and is
        // tracked as a follow-up.
        '@typescript-eslint/no-unnecessary-condition': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'error',

        // Correct sorting of number arrays: `.sort()` compares stringified
        // elements, so a numeric array needs an explicit comparator.
        '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],

        // No empty code blocks.
        'no-empty': ['error', { allowEmptyCatch: false }],
        '@typescript-eslint/no-empty-function': 'error',

        // No conditional statements with the same result.
        'no-dupe-else-if': 'error',
        'no-duplicate-case': 'error',
        'sonarjs/no-all-duplicated-branches': 'error',
        'sonarjs/no-duplicated-branches': 'error',
        'sonarjs/no-identical-conditions': 'error',
        'sonarjs/no-identical-expressions': 'error'
    }
};
