import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { OrderRow } from '../../model/order-row.model';
import { ResultsFilterValue } from '../order-list-filter-select/order-list-filter-select.component';

type FilterableColumn = 'createdAt' | 'fileName' | 'sampleIds' | 'sampleIdsAVV' | 'pathogens' | 'nrls';

type ResultsCategory = 'partial' | 'complete' | 'none';

@Component({
    standalone: false,
    selector: 'mibi-order-list-view',
    templateUrl: './order-list-view.component.html',
    styleUrls: ['./order-list-view.component.scss']
})
export class OrderListViewComponent implements AfterViewInit, OnDestroy {
    @Input() set rows(value: OrderRow[] | null) {
        const rows = value ?? [];
        // A freshly queried list (different orders) resets to the default sort;
        // merely attaching samples to an order must not clobber the user's sort.
        const orderIds = rows.map(row => row.id).join(',');
        const isNewList = orderIds !== this.knownOrderIds;
        this.knownOrderIds = orderIds;

        this.dataSource.data = rows;
        if (isNewList) {
            this.applyDefaultSort();
        }
        this.emitSequence();
    }
    @Output() openOrderResults = new EventEmitter<string>();
    /** The order ids in the sequence the table currently displays. */
    @Output() sequenceChange = new EventEmitter<string[]>();
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private static readonly DATE_FORMAT = 'dd.MM.yyyy HH:mm';
    private readonly datePipe = new DatePipe('de-DE');

    readonly displayedColumns: ReadonlyArray<keyof OrderRow | 'actions'> = [
        'createdAt',
        'fileName',
        'sampleIds',
        'sampleIdsAVV',
        'pathogens',
        'nrls',
        'sampleCount',
        'results',
        'actions'
    ];

    readonly filterColumns: ReadonlyArray<FilterableColumn> = [
        'createdAt',
        'fileName',
        'sampleIds',
        'sampleIdsAVV',
        'pathogens',
        'nrls'
    ];

    columnFilters: Record<FilterableColumn, string> = {
        createdAt: '',
        fileName: '',
        sampleIds: '',
        sampleIdsAVV: '',
        pathogens: '',
        nrls: ''
    };

    resultsFilter: ResultsFilterValue = '';

    // Orders whose results the user has already opened (clicked the arrow in
    // "Auftrag ansehen"). Their results number is shown in normal weight; orders
    // with results that have not been opened yet are shown in bold.
    private readonly seenOrderIds = new Set<string>();

    // Order ids of the list last received, to detect a freshly queried list.
    private knownOrderIds = '';
    private sortSubscription?: Subscription;

    dataSource = new MatTableDataSource<OrderRow>([]);

    constructor() {
        this.dataSource.filterPredicate = (row, filter) => {
            const parsed = JSON.parse(filter) as {
                columns: Record<FilterableColumn, string>;
                results: ResultsFilterValue;
            };

            const columnsMatch = (Object.keys(parsed.columns) as FilterableColumn[]).every(key => {
                const searchTerm = parsed.columns[key].trim().toLowerCase();
                if (!searchTerm) {
                    return true;
                }
                return this.formatCell(row, key).toLowerCase().includes(searchTerm);
            });
            if (!columnsMatch) {
                return false;
            }

            if (parsed.results) {
                return OrderListViewComponent.classifyResults(row.results) === parsed.results;
            }
            return true;
        };

        this.dataSource.sortingDataAccessor = (row, property) => {
            if (property === 'createdAt') {
                return row.createdAt instanceof Date
                    ? row.createdAt.getTime()
                    : new Date(row.createdAt).getTime();
            }
            const value = row[property as keyof OrderRow];
            return typeof value === 'string' ? value.toLowerCase() : (value as number);
        };
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.applyDefaultSort();
        this.sortSubscription = this.sort.sortChange.subscribe(() => this.emitSequence());
        this.emitSequence();
    }

    ngOnDestroy(): void {
        this.sortSubscription?.unsubscribe();
        this.openOrderResults.complete();
        this.sequenceChange.complete();
    }

    onFilterChange(column: FilterableColumn, value: string): void {
        this.columnFilters = {
            ...this.columnFilters,
            [column]: value
        };
        this.applyFilter();
    }

    onResultsFilterChange(value: ResultsFilterValue): void {
        this.resultsFilter = value;
        this.applyFilter();
    }

    onOpenResults(row: OrderRow): void {
        this.seenOrderIds.add(row.id);
        this.openOrderResults.emit(row.id);
    }

    get rowCount(): number {
        return this.dataSource.data.length;
    }

    resultsCategory(row: OrderRow): ResultsCategory {
        return OrderListViewComponent.classifyResults(row.results);
    }

    // Highlight (bold) the results number when the order has new BfR results
    // (at least one result) that the user has not opened yet.
    resultsUnseen(row: OrderRow): boolean {
        return this.resultsCategory(row) !== 'none' && !this.seenOrderIds.has(row.id);
    }

    // Default ordering: newest first by date. Re-applied whenever the order list
    // is queried anew from the backend.
    private applyDefaultSort(): void {
        if (!this.sort) {
            return;
        }
        this.sort.active = 'createdAt';
        this.sort.direction = 'desc';
        this.sort.sortChange.emit({ active: 'createdAt', direction: 'desc' });
    }

    // Publishes the sequence the table displays (current sorting + filtering,
    // across all pages) so other views can step through the orders in that order.
    private emitSequence(): void {
        const filtered = this.dataSource.filteredData ?? this.dataSource.data;
        const displayed = this.sort
            ? this.dataSource.sortData([...filtered], this.sort)
            : filtered;
        this.sequenceChange.emit(displayed.map(row => row.id));
    }

    private applyFilter(): void {
        this.dataSource.filter = JSON.stringify({
            columns: this.columnFilters,
            results: this.resultsFilter
        });
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
        this.emitSequence();
    }

    private formatCell(row: OrderRow, column: FilterableColumn): string {
        if (column === 'createdAt') {
            return this.datePipe.transform(row.createdAt, OrderListViewComponent.DATE_FORMAT) ?? '';
        }
        return row[column] ?? '';
    }

    // The order's "results" field is a "done/total" fraction (e.g. "3/5").
    // Map it to the categories used for cell colouring and the dropdown filter:
    // some (but not all) results -> partial (yellow), all results -> complete (green).
    private static classifyResults(results: string): ResultsCategory {
        const match = /^(\d+)\s*\/\s*(\d+)$/.exec((results ?? '').trim());
        if (!match) {
            return 'none';
        }
        const done = Number(match[1]);
        const total = Number(match[2]);
        if (total <= 0 || done <= 0) {
            return 'none';
        }
        return done >= total ? 'complete' : 'partial';
    }
}
