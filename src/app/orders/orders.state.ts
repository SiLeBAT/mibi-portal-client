import { MemoizedSelector } from '@ngrx/store';
import { createSliceSelector } from '../shared/model/state-slice';
import { OrderListState } from './state/order-list.reducer';

export const ORDERS_SLICE_NAME = 'orders';

export interface OrdersSlice<T> {
    [ORDERS_SLICE_NAME]: T;
}

export type OrdersMainSlice = OrdersSlice<OrderListState>;

export function selectOrdersSlice<T>(): MemoizedSelector<OrdersSlice<T>, T> {
    return createSliceSelector<OrdersSlice<T>, T>(ORDERS_SLICE_NAME);
}
