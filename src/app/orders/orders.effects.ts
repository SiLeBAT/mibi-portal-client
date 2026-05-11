import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { showBannerSOA } from '../core/state/core.actions';
import { DataService } from '../core/services/data.service';
import { LogService } from '../core/services/log.service';
import { sendSamplesAddSentFileSOA } from '../samples/send-samples/state/send-samples.actions';
import { userUpdateCurrentUserSOA } from '../user/state/user.actions';
import { orderListUpdateSOA } from './state/order-list.actions';

@Injectable()
export class OrderListEffects {

    constructor(
        private actions$: Actions,
        private dataService: DataService,
        private logger: LogService
    ) { }

    loadOrderList$ = createEffect(() => this.actions$.pipe(
        ofType(userUpdateCurrentUserSOA, sendSamplesAddSentFileSOA),
        concatMap(() => this.loadOrderList())
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
}
