import { joinValues, joinValuesTruncated, maxDisplayedValues } from './order-values';

const sampleIds = (count: number): string[] =>
    Array.from({ length: count }, (_, index) => `S-${index + 1}`);

// An order the backend sent without the column at all.
const missing: { values?: string[] } = {};

describe('joinValues', () => {
    it('is empty without values', () => {
        expect(joinValues(missing.values)).toBe('');
        expect(joinValues([])).toBe('');
    });

    it('drops duplicates', () => {
        expect(joinValues(['a', 'b', 'a'])).toBe('a, b');
    });

    it('keeps every value, however many there are', () => {
        const values = sampleIds(maxDisplayedValues + 5);

        expect(joinValues(values)).toBe(values.join(', '));
    });
});

describe('joinValuesTruncated', () => {
    it('is empty without values', () => {
        expect(joinValuesTruncated(missing.values)).toBe('');
        expect(joinValuesTruncated([])).toBe('');
    });

    it('shows all values while they still fit', () => {
        const values = sampleIds(maxDisplayedValues);

        expect(joinValuesTruncated(values)).toBe(values.join(', '));
    });

    it('cuts off after the tenth value and marks the rest with an ellipsis', () => {
        const values = sampleIds(maxDisplayedValues + 1);

        expect(joinValuesTruncated(values)).toBe(`${sampleIds(maxDisplayedValues).join(', ')}, ...`);
    });

    it('counts distinct values, not raw ones', () => {
        const values = [...sampleIds(maxDisplayedValues), 'S-1', 'S-2'];

        expect(joinValuesTruncated(values)).toBe(sampleIds(maxDisplayedValues).join(', '));
    });
});
