import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface OrderListOrder {
    id: number;
    date: Date;
    name: string;
}

@Component({
    selector: 'mibi-order-list-view',
    templateUrl: './order-list-view.component.html',
    styleUrls: ['./order-list-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListViewComponent implements AfterViewInit, OnChanges {
    @Input() orders: OrderListOrder[];
    @Output() orderClick = new EventEmitter<number>();

    readonly dataSource = new MatTableDataSource<OrderListOrder>();
    readonly displayedColumns = ['date', 'name'];

    @ViewChild(MatSort)
    private sort: MatSort;

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.orders) {
            this.dataSource.data = changes.orders.currentValue as OrderListOrder[];
        }
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
            switch(sortHeaderId) {
                case 'name': return data.name.toLocaleLowerCase();
                case 'date': return data.date.getTime();
                default: return 0;
            }
        };
    }

    onRowClick(id: number): void {
        this.orderClick.emit(id);
    }
}
