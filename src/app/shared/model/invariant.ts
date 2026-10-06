/**
 * Asserts that an index-signature lookup found something.
 *
 * With `noUncheckedIndexedAccess` every `obj[key]` is `T | undefined`, which is
 * correct for data that may not be there. Some lookups, though, are guaranteed
 * by the surrounding code -- the data grid renders exactly the rows and columns
 * of its own view model, for instance. For those, a miss means two structures
 * have diverged, and failing immediately names the problem instead of letting
 * an `undefined` surface somewhere far from its cause.
 */
export function required<T>(value: T | undefined, what: string): T {
    if (value === undefined) {
        throw new Error(`Required value missing: ${what}`);
    }
    return value;
}
