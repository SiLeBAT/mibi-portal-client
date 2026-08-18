/** Order list columns that can be narrowed down with a free text filter. */
export type FilterableColumn = 'createdAt' | 'fileName' | 'sampleIds' | 'sampleIdsAVV' | 'pathogens' | 'nrls';

/** Value of the "BfR-Ergebnisse verfügbar" filter; '' means "not filtered". */
export type ResultsFilterValue = '' | 'partial' | 'complete';

/** The complete filter state of the order list table. */
export interface OrderListFilter {
    columns: Record<FilterableColumn, string>;
    results: ResultsFilterValue;
}

export const filterableColumns: ReadonlyArray<FilterableColumn> = [
    'createdAt',
    'fileName',
    'sampleIds',
    'sampleIdsAVV',
    'pathogens',
    'nrls'
];

const resultsFilterValues: ReadonlySet<string> = new Set<ResultsFilterValue>(['', 'partial', 'complete']);

/** The unfiltered state: no column search terms and no results filter. */
export function emptyOrderListFilter(): OrderListFilter {
    return {
        columns: {
            createdAt: '',
            fileName: '',
            sampleIds: '',
            sampleIdsAVV: '',
            pathogens: '',
            nrls: ''
        },
        results: ''
    };
}

export function isEmptyOrderListFilter(filter: OrderListFilter): boolean {
    return filter.results === ''
        && filterableColumns.every(column => !filter.columns[column]);
}

/**
 * Rebuilds a filter from an untyped value (e.g. one read back from storage),
 * keeping only known columns and valid values, so that outdated or manipulated
 * data cannot break the table.
 */
export function parseOrderListFilter(value: unknown): OrderListFilter {
    const filter = emptyOrderListFilter();
    if (!value || typeof value !== 'object') {
        return filter;
    }

    const candidate = value as { columns?: unknown; results?: unknown };
    if (candidate.columns && typeof candidate.columns === 'object') {
        const columns = candidate.columns as Record<string, unknown>;
        for (const column of filterableColumns) {
            const searchTerm = columns[column];
            if (typeof searchTerm === 'string') {
                filter.columns[column] = searchTerm;
            }
        }
    }
    if (typeof candidate.results === 'string' && resultsFilterValues.has(candidate.results)) {
        filter.results = candidate.results as ResultsFilterValue;
    }
    return filter;
}
