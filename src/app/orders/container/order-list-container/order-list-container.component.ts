import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { UserMainSlice } from '../../../user/user.state';
import { selectUserCurrentUser } from '../../../user/state/user.selectors';
import { OrderRow } from '../../model/order-row.model';
import { OrderListFilter } from '../../model/order-list-filter.model';
import { parseOrderDate } from '../../model/order-date';
import { joinValues, joinValuesTruncated } from '../../model/order-values';
import { OrderListFilterStorageService } from '../../services/order-list-filter-storage.service';
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
                [dataSaveAgreed]="dataSaveAgreed$ | async"
                [filter]="filter"
                (filterChange)="onFilterChange($event)"
                (openOrderResults)="onOpenOrderResults($event)"
                (sequenceChange)="onSequenceChange($event)"
            ></mibi-order-list-view>
        }
    `
})
export class OrderListContainerComponent {
    rows$: Observable<OrderRow[]>;
    isLoggedIn$: Observable<boolean>;
    dataSaveAgreed$: Observable<boolean>;
    // Restored from the current browser session, so that a filter set before
    // leaving the list (e.g. to view an order's results) is still active when
    // the user returns.
    filter: OrderListFilter;

    constructor(
        private store$: Store<OrdersMainSlice & UserMainSlice>,
        private filterStorage: OrderListFilterStorageService
    ) {
        this.filter = this.filterStorage.load();
        this.rows$ = this.store$.pipe(
            select(selectOrderList),
            map(orders => orders.map(order => this.orderToRow(order)))
        );
        this.isLoggedIn$ = this.store$.pipe(
            select(selectUserCurrentUser),
            map(currentUser => !!currentUser)
        );
        this.dataSaveAgreed$ = this.store$.pipe(
            select(selectUserCurrentUser),
            map(currentUser => currentUser?.dataSaveAgreed === true)
        );
    }

    onFilterChange(filter: OrderListFilter): void {
        this.filter = filter;
        this.filterStorage.save(filter);
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
            // The sample number columns keep the complete list, so that a filter
            // still finds a sample number the cell no longer shows.
            sampleIds: joinValues(order.sampleIds),
            sampleIdsDisplay: joinValuesTruncated(order.sampleIds),
            sampleIdsAVV: joinValues(order.sampleIdsAVV),
            sampleIdsAVVDisplay: joinValuesTruncated(order.sampleIdsAVV),
            pathogens: joinValues(order.pathogens),
            nrls: joinValues(order.nrls),
            sampleCount: order.sampleCount,
            results: order.results
        };
    }
}
