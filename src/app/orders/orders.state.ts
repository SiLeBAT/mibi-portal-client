import { createFeatureSelector } from '@ngrx/store';
import { OrderListState } from './state/order-list.reducer';

export const ORDERS_SLICE_NAME = 'orders';

export interface OrdersSlice<T> {
    [ORDERS_SLICE_NAME]: T;
}

export type OrdersMainSlice = OrdersSlice<OrderListState>;

export function selectOrdersSlice<T>() {
    return createFeatureSelector<OrdersSlice<T>, T>(ORDERS_SLICE_NAME);
}
