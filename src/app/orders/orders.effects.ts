import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, filter, map, withLatestFrom } from 'rxjs/operators';
import { showBannerSOA } from '../core/state/core.actions';
import { DataService } from '../core/services/data.service';
import { LogService } from '../core/services/log.service';
import { sendSamplesAddSentFileSOA } from '../samples/send-samples/state/send-samples.actions';
import { userUpdateCurrentUserSOA } from '../user/state/user.actions';
import { OrdersMainSlice } from './orders.state';
import {
    orderListAddSamplesWithResultsSOA,
    orderListLoadSamplesWithResultsSOA,
    orderListUpdateSOA
} from './state/order-list.actions';
import { selectOrderList } from './state/order-list.selectors';

@Injectable()
export class OrderListEffects {

    constructor(
        private actions$: Actions,
        private store$: Store<OrdersMainSlice>,
        private dataService: DataService,
        private logger: LogService
    ) { }

    loadOrderList$ = createEffect(() => this.actions$.pipe(
        ofType(userUpdateCurrentUserSOA, sendSamplesAddSentFileSOA),
        concatMap(() => this.loadOrderList())
    ));

    loadSamplesWithResults$ = createEffect(() => this.actions$.pipe(
        ofType(orderListLoadSamplesWithResultsSOA),
        withLatestFrom(this.store$.select(selectOrderList)),
        filter(([action, orders]) =>
            !orders.find(order => order.id === action.orderId)?.samples
        ),
        concatMap(([action]) => this.loadSamplesWithResults(action.orderId))
    ));

    private loadOrderList(): Observable<Action> {
        return this.dataService.getOrderList().pipe(
            map(orders => orderListUpdateSOA({ orders: orders })),
            catchError(error => {
                this.logger.error('Unable to fetch order list', error.stack);
                return of(showBannerSOA({ predefined: 'defaultError' }));
            })
        );
    }

    private loadSamplesWithResults(orderId: string): Observable<Action> {
        return this.dataService.getSamplesWithResults(orderId).pipe(
            map(response => orderListAddSamplesWithResultsSOA({
                orderId: response.orderId,
                samples: response.samples
            })),
            catchError(error => {
                this.logger.error('Unable to fetch samples with results', error.stack);
                return of(showBannerSOA({ predefined: 'defaultError' }));
            })
        );
    }
}
