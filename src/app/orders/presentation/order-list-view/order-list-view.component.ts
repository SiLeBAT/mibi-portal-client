import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OrderRow } from '../../model/order-row.model';

type FilterableColumn = 'createdAt' | 'fileName' | 'pathogens' | 'nrls';

@Component({
    standalone: false,
    selector: 'mibi-order-list-view',
    templateUrl: './order-list-view.component.html',
    styleUrls: ['./order-list-view.component.scss']
})
export class OrderListViewComponent implements AfterViewInit, OnDestroy {
    @Input() set rows(value: OrderRow[] | null) {
        this.dataSource.data = value ?? [];
    }
    @Output() openOrderResults = new EventEmitter<string>();
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    private static readonly DATE_FORMAT = 'dd.MM.yyyy HH:mm';
    private readonly datePipe = new DatePipe('de-DE');

    readonly displayedColumns: ReadonlyArray<keyof OrderRow | 'actions'> = [
        'createdAt',
        'fileName',
        'pathogens',
        'nrls',
        'sampleCount',
        'results',
        'actions'
    ];

    readonly filterColumns: ReadonlyArray<FilterableColumn> = [
        'createdAt',
        'fileName',
        'pathogens',
        'nrls'
    ];

    columnFilters: Record<FilterableColumn, string> = {
        createdAt: '',
        fileName: '',
        pathogens: '',
        nrls: ''
    };

    dataSource = new MatTableDataSource<OrderRow>([]);

    constructor() {
        this.dataSource.filterPredicate = (row, filter) => {
            const filters = JSON.parse(filter) as Record<FilterableColumn, string>;
            return (Object.keys(filters) as FilterableColumn[]).every(key => {
                const searchTerm = filters[key].trim().toLowerCase();
                if (!searchTerm) {
                    return true;
                }
                return this.formatCell(row, key).toLowerCase().includes(searchTerm);
            });
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
    }

    ngOnDestroy(): void {
        this.openOrderResults.complete();
    }

    onFilterChange(column: FilterableColumn, value: string): void {
        this.columnFilters = {
            ...this.columnFilters,
            [column]: value
        };
        this.dataSource.filter = JSON.stringify(this.columnFilters);
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    onOpenResults(row: OrderRow): void {
        this.openOrderResults.emit(row.id);
    }

    get rowCount(): number {
        return this.dataSource.data.length;
    }

    private formatCell(row: OrderRow, column: FilterableColumn): string {
        if (column === 'createdAt') {
            return this.datePipe.transform(row.createdAt, OrderListViewComponent.DATE_FORMAT) ?? '';
        }
        return row[column] ?? '';
    }
}
