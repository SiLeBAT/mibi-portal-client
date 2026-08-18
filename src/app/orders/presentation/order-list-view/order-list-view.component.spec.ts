import { OrderRow } from '../../model/order-row.model';
import { OrderListFilter, emptyOrderListFilter } from '../../model/order-list-filter.model';
import { OrderListViewComponent } from './order-list-view.component';

const row = (id: string, results: string, fileName = `${id}.xlsx`): OrderRow => ({
    id: id,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    fileName: fileName,
    sampleIds: '',
    sampleIdsAVV: '',
    pathogens: '',
    nrls: '',
    sampleCount: 1,
    results: results
});

const rows = [row('a', '1/1'), row('b', '2/5'), row('c', '0/3')];

const filterFor = (results: OrderListFilter['results']): OrderListFilter => ({
    ...emptyOrderListFilter(),
    results: results
});

const displayedIds = (component: OrderListViewComponent): string[] =>
    component.dataSource.filteredData.map(entry => entry.id);

describe('OrderListViewComponent filtering', () => {
    let component: OrderListViewComponent;

    beforeEach(() => {
        component = new OrderListViewComponent();
    });

    it('shows all orders without a filter', () => {
        component.rows = rows;
        expect(displayedIds(component)).toEqual(['a', 'b', 'c']);
    });

    it('applies a filter handed in by the container to the incoming rows', () => {
        component.filter = filterFor('complete');
        component.rows = rows;

        expect(displayedIds(component)).toEqual(['a']);
        expect(component.activeFilter.results).toBe('complete');
    });

    it('applies a filter handed in after the rows arrived', () => {
        component.rows = rows;
        component.filter = filterFor('partial');

        expect(displayedIds(component)).toEqual(['b']);
    });

    it('reports the filtered sequence so the results view follows it', () => {
        const sequences: string[][] = [];
        component.sequenceChange.subscribe(ids => sequences.push(ids));

        component.rows = rows;
        component.filter = filterFor('complete');

        expect(sequences[sequences.length - 1]).toEqual(['a']);
    });

    it('falls back to an unfiltered table when no filter is bound', () => {
        component.filter = null;
        component.rows = rows;

        expect(component.activeFilter).toEqual(emptyOrderListFilter());
        expect(displayedIds(component)).toEqual(['a', 'b', 'c']);
    });

    it('emits the complete filter when the results filter changes', () => {
        const emitted: OrderListFilter[] = [];
        component.filterChange.subscribe(filter => emitted.push(filter));
        component.rows = rows;

        component.onResultsFilterChange('complete');

        expect(emitted).toEqual([filterFor('complete')]);
        expect(displayedIds(component)).toEqual(['a']);
    });

    it('emits the complete filter when a column filter changes', () => {
        const emitted: OrderListFilter[] = [];
        component.filterChange.subscribe(filter => emitted.push(filter));
        component.filter = filterFor('complete');
        component.rows = [row('a', '1/1', 'first.xlsx'), row('d', '2/2', 'second.xlsx')];

        component.onFilterChange('fileName', 'second');

        expect(emitted[0].results).toBe('complete');
        expect(emitted[0].columns.fileName).toBe('second');
        expect(displayedIds(component)).toEqual(['d']);
    });

    it('does not re-apply the filter the container echoes back', () => {
        const emitted: OrderListFilter[] = [];
        component.filterChange.subscribe(filter => emitted.push(filter));
        component.rows = rows;

        component.onResultsFilterChange('complete');
        // What the container binds back is the very object that was emitted.
        component.filter = emitted[0];

        expect(emitted.length).toBe(1);
        expect(displayedIds(component)).toEqual(['a']);
    });
});
