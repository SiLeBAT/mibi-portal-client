import { createReducer, on } from '@ngrx/store';
import { OrderEntryDTO } from '../../core/model/response.model';
import {
    orderListAddSamplesWithResultsSOA,
    orderListDestroySOA,
    orderListUpdateSOA,
    orderListUpdateSequenceSOA
} from './order-list.actions';

// STATE

export interface OrderListState {
    orders: OrderEntryDTO[];
    // Order ids in the sequence the order list table currently displays.
    // Empty until the table reports it; consumers then fall back to `orders`.
    sequence: string[];
}

const initialState: OrderListState = {
    orders: [],
    sequence: []
};

// REDUCER

export const orderListReducer = createReducer<OrderListState>(
    initialState,
    // A freshly fetched list invalidates the previously reported sequence.
    on(orderListUpdateSOA, (state, action) => ({
        ...state,
        orders: action.orders,
        sequence: []
    })),
    on(orderListDestroySOA, () => initialState),
    on(orderListAddSamplesWithResultsSOA, (state, action) => ({
        ...state,
        orders: state.orders.map(order =>
            order.id === action.orderId
                ? { ...order, samples: action.samples }
                : order
        )
    })),
    on(orderListUpdateSequenceSOA, (state, action) => ({
        ...state,
        sequence: action.orderIds
    }))
);
