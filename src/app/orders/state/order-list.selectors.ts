import { createSelector } from '@ngrx/store';
import { selectOrdersSlice } from '../orders.state';
import { OrderListState } from './order-list.reducer';

export const selectOrderListState = selectOrdersSlice<OrderListState>();

export const selectOrderList = createSelector(selectOrderListState, state => state.orders);
