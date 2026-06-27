import { createReducer, on } from '@ngrx/store';
import { OrderEntryDTO } from '../../core/model/response.model';
import {
    orderListAddSamplesWithResultsSOA,
    orderListDestroySOA,
    orderListUpdateSOA
} from './order-list.actions';

// STATE

export type OrderListState = OrderEntryDTO[];

// REDUCER

export const orderListReducer = createReducer<OrderListState>(
    [],
    on(orderListUpdateSOA, (_state, action) => action.orders),
    on(orderListDestroySOA, _state => []),
    on(orderListAddSamplesWithResultsSOA, (state, action) =>
        state.map(order =>
            order.id === action.orderId
                ? { ...order, samples: action.samples }
                : order
        )
    )
);
