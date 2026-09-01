/**
 * Number of values a multi-value order column ("Ihre Probenummer",
 * "Probenummer nach AVV DatA") shows before it is cut off. An order can carry
 * hundreds of sample numbers, which would blow up the row height.
 */
export const maxDisplayedValues = 10;

/** The distinct values of an order column, in the order they arrived. */
export function uniqueValues(values: string[] | undefined): string[] {
    if (!values?.length) {
        return [];
    }
    return [...new Set(values)];
}

/** All distinct values, comma separated. Used for filtering and sorting. */
export function joinValues(values: string[] | undefined): string {
    return uniqueValues(values).join(', ');
}

/**
 * The first {@link maxDisplayedValues} distinct values, comma separated and
 * followed by an ellipsis if any were left out. Used for display only - the
 * full list stays on the row so that filtering still finds every value.
 */
export function joinValuesTruncated(values: string[] | undefined): string {
    const unique = uniqueValues(values);
    if (unique.length <= maxDisplayedValues) {
        return unique.join(', ');
    }
    return `${unique.slice(0, maxDisplayedValues).join(', ')}, ...`;
}
