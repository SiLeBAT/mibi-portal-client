import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UserLinkProviderService } from '../../../user/link-provider.service';
import { OrderRow } from '../../model/order-row.model';
import {
    FilterableColumn,
    OrderListFilter,
    ResultsFilterValue,
    emptyOrderListFilter,
    filterableColumns
} from '../../model/order-list-filter.model';

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
    // The filter the table applies. It is owned by the container so that it
    // outlives this component, which is destroyed whenever the user leaves the
    // list. Treated as immutable here: a change always replaces the whole object.
    @Input() set filter(value: OrderListFilter | null) {
        const next = value ?? emptyOrderListFilter();
        if (next === this.activeFilter) {
            // The container merely echoes back what filterChange emitted.
            return;
        }
        this.activeFilter = next;
        this.applyFilter();
    }
    // Whether the user agreed to storing their data. Without that consent no
    // order will ever appear in the list, which the hint below the table explains.
    @Input() dataSaveAgreed: boolean | null = null;
    @Output() filterChange = new EventEmitter<OrderListFilter>();
    @Output() openOrderResults = new EventEmitter<string>();
    /** The order ids in the sequence the table currently displays. */
    @Output() sequenceChange = new EventEmitter<string[]>();
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatTable) table!: MatTable<OrderRow>;

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

    activeFilter: OrderListFilter = emptyOrderListFilter();

    // Orders whose results the user has already opened (clicked the arrow in
    // "Auftrag ansehen"). Their results number is shown in normal weight; orders
    // with results that have not been opened yet are shown in bold.
    private readonly seenOrderIds = new Set<string>();

    // Order ids of the list last received, to detect a freshly queried list.
    private knownOrderIds = '';
    private sortSubscription?: Subscription;
    private resizeSubscription?: Subscription;

    dataSource = new MatTableDataSource<OrderRow>([]);

    constructor(public userLinks: UserLinkProviderService) {
        this.dataSource.filterPredicate = (row, filter) => {
            const parsed = JSON.parse(filter) as OrderListFilter;

            const columnsMatch = filterableColumns.every(key => {
                const searchTerm = (parsed.columns[key] ?? '').trim().toLowerCase();
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
        // The filter row sticks below the title row, at an offset Material
        // measures from the title row's height. A narrower window re-wraps the
        // titles and changes that height, so the offset has to be measured anew.
        this.resizeSubscription = fromEvent(window, 'resize')
            .pipe(debounceTime(100))
            .subscribe(() => this.table?.updateStickyHeaderRowStyles());
        this.emitSequence();
    }

    ngOnDestroy(): void {
        this.sortSubscription?.unsubscribe();
        this.resizeSubscription?.unsubscribe();
        this.openOrderResults.complete();
        this.sequenceChange.complete();
        this.filterChange.complete();
    }

    onFilterChange(column: FilterableColumn, value: string): void {
        this.updateFilter({
            ...this.activeFilter,
            columns: {
                ...this.activeFilter.columns,
                [column]: value
            }
        });
    }

    onResultsFilterChange(value: ResultsFilterValue): void {
        this.updateFilter({
            ...this.activeFilter,
            results: value
        });
    }

    onOpenResults(row: OrderRow): void {
        this.seenOrderIds.add(row.id);
        this.openOrderResults.emit(row.id);
    }

    get rowCount(): number {
        return this.dataSource.data.length;
    }

    // Both cases the hint addresses end up here: the user never agreed to storing
    // their data, or withdrew the agreement (which deleted all their orders).
    // Deliberately based on the unfiltered row count - an empty table caused by a
    // filter has nothing to do with the missing consent.
    get showConsentHint(): boolean {
        return this.rowCount === 0 && !this.dataSaveAgreed;
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

    private updateFilter(next: OrderListFilter): void {
        this.activeFilter = next;
        this.applyFilter();
        this.filterChange.emit(next);
    }

    private applyFilter(): void {
        this.dataSource.filter = JSON.stringify(this.activeFilter);
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
