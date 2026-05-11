import { Action, ActionReducerMap } from '@ngrx/store';
import { OrderListState, orderListReducer } from './state/order-list.reducer';
import { OrderListEffects } from './orders.effects';

type OrdersState = OrderListState;

export const ordersReducerMap: ActionReducerMap<OrdersState, Action> = {
    orders: orderListReducer
};

export const ordersEffects = [
    OrderListEffects
];
