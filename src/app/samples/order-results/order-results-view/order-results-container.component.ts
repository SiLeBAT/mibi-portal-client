import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { OrdersMainSlice } from '../../../orders/orders.state';
import { orderListLoadSamplesWithResultsSOA } from '../../../orders/state/order-list.actions';
import { selectOrderById } from '../../../orders/state/order-list.selectors';
import { SamplesGridViewModel } from '../../samples-grid/samples-grid.model';
import { buildResultsGridViewModel } from '../results-grid/results-grid.builder';
import { resultsGridModel } from '../results-grid/results-grid.constants';

@Component({
    standalone: false,
    selector: 'mibi-order-results-container',
    template: `
        <mibi-order-results-view
            [order]="order$ | async"
            [model]="gridModel$ | async"
        ></mibi-order-results-view>
    `
})
export class OrderResultsContainerComponent {
    readonly order$: Observable<OrderEntryDTO | undefined>;
    readonly gridModel$: Observable<SamplesGridViewModel>;

    private readonly orderId: string;

    constructor(
        private readonly store$: Store<OrdersMainSlice>,
        route: ActivatedRoute
    ) {
        this.orderId = route.snapshot.paramMap.get('orderId') ?? '';
        // Ensure samples + results are loaded (the effect guards against re-fetching);
        // this also makes the view work on a direct deep-link / page refresh.
        this.store$.dispatch(orderListLoadSamplesWithResultsSOA({ orderId: this.orderId }));
        this.order$ = this.store$.pipe(select(selectOrderById(this.orderId)));
        this.gridModel$ = this.order$.pipe(
            map(order => buildResultsGridViewModel(resultsGridModel, order?.samples ?? []))
        );
    }
}
