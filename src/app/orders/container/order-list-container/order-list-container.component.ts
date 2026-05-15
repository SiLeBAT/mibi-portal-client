import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { UserMainSlice } from '../../../user/user.state';
import { selectUserCurrentUser } from '../../../user/state/user.selectors';
import { OrderRow } from '../../model/order-row.model';
import { OrdersMainSlice } from '../../orders.state';
import { selectOrderList } from '../../state/order-list.selectors';

interface ParseDateObject {
    iso: string;
}

@Component({
    standalone: false,
    selector: 'mibi-order-list-container',
    template: `
        @if (isLoggedIn$ | async) {
            <mibi-order-list-view
                [rows]="rows$ | async"
                (openOrderResults)="onOpenOrderResults($event)"
            ></mibi-order-list-view>
        }
    `
})
export class OrderListContainerComponent {
    rows$: Observable<OrderRow[]>;
    isLoggedIn$: Observable<boolean>;

    constructor(private store$: Store<OrdersMainSlice & UserMainSlice>) {
        this.rows$ = this.store$.pipe(
            select(selectOrderList),
            map(orders => orders.map(order => this.orderToRow(order)))
        );
        this.isLoggedIn$ = this.store$.pipe(
            select(selectUserCurrentUser),
            map(currentUser => !!currentUser)
        );
    }

    onOpenOrderResults(_orderId: string): void {
        // Stub: detail view does not exist yet.
    }

    private orderToRow(order: OrderEntryDTO): OrderRow {
        return {
            id: order.id,
            createdAt: this.parseDate(order.createdAt),
            fileName: order.fileName,
            pathogens: this.joinUnique(order.pathogens),
            nrls: this.joinUnique(order.nrls),
            sampleCount: order.sampleCount,
            results: order.results
        };
    }

    private parseDate(raw: unknown): Date {
        if (raw instanceof Date) {
            return raw;
        }
        if (typeof raw === 'string' || typeof raw === 'number') {
            return new Date(raw);
        }
        if (this.isParseDateObject(raw)) {
            return new Date(raw.iso);
        }
        return new Date(Number.NaN);
    }

    private isParseDateObject(value: unknown): value is ParseDateObject {
        return (
            typeof value === 'object' &&
            value !== null &&
            typeof (value as { iso?: unknown }).iso === 'string'
        );
    }

    private joinUnique(values: string[] | undefined): string {
        if (!values?.length) {
            return '';
        }
        return [...new Set(values)].join(', ');
    }
}
