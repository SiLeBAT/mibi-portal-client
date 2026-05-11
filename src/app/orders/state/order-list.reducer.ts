import { createReducer, on } from '@ngrx/store';
import { OrderEntryDTO } from '../../core/model/response.model';
import { orderListDestroySOA, orderListUpdateSOA } from './order-list.actions';

// STATE

export interface OrderListState {
    orders: OrderEntryDTO[];
}

// REDUCER

export const orderListReducer = createReducer<OrderEntryDTO[]>(
    [],
    on(orderListUpdateSOA, (_state, action) => action.orders),
    on(orderListDestroySOA, _state => [])
);
