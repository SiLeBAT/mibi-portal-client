import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { UserMainSlice } from '../../../user/user.state';
import { selectUserCurrentUser } from '../../../user/state/user.selectors';
import { OrderRow } from '../../model/order-row.model';
import { parseOrderDate } from '../../model/order-date';
import { OrdersMainSlice } from '../../orders.state';
import { orderListUpdateSequenceSOA } from '../../state/order-list.actions';
import { selectOrderList } from '../../state/order-list.selectors';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { orderResultsPath } from '../../orders.paths';

@Component({
    standalone: false,
    selector: 'mibi-order-list-container',
    template: `
        @if (isLoggedIn$ | async) {
            <mibi-order-list-view
                [rows]="rows$ | async"
                (openOrderResults)="onOpenOrderResults($event)"
                (sequenceChange)="onSequenceChange($event)"
            ></mibi-order-list-view>
        }
    `
})
export class OrderListContainerComponent {
    rows$: Observable<OrderRow[]>;
    isLoggedIn$: Observable<boolean>;

    constructor(
        private store$: Store<OrdersMainSlice & UserMainSlice>
    ) {
        this.rows$ = this.store$.pipe(
            select(selectOrderList),
            map(orders => orders.map(order => this.orderToRow(order)))
        );
        this.isLoggedIn$ = this.store$.pipe(
            select(selectUserCurrentUser),
            map(currentUser => !!currentUser)
        );
    }

    onOpenOrderResults(orderId: string): void {
        this.store$.dispatch(navigateMSA({ path: orderResultsPath(orderId) }));
    }

    // Keep the store in sync with the sequence the table displays, so the results
    // view can step through the orders in exactly that order.
    onSequenceChange(orderIds: string[]): void {
        this.store$.dispatch(orderListUpdateSequenceSOA({ orderIds: orderIds }));
    }

    private orderToRow(order: OrderEntryDTO): OrderRow {
        return {
            id: order.id,
            createdAt: parseOrderDate(order.createdAt) ?? new Date(Number.NaN),
            fileName: order.fileName,
            sampleIds: this.joinUnique(order.sampleIds),
            sampleIdsAVV: this.joinUnique(order.sampleIdsAVV),
            pathogens: this.joinUnique(order.pathogens),
            nrls: this.joinUnique(order.nrls),
            sampleCount: order.sampleCount,
            results: order.results
        };
    }

    private joinUnique(values: string[] | undefined): string {
        if (!values?.length) {
            return '';
        }
        return [...new Set(values)].join(', ');
    }
}
