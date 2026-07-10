import { createSelector } from '@ngrx/store';
import { OrderEntryDTO } from '../../core/model/response.model';
import { selectOrdersSlice } from '../orders.state';
import { OrderListState } from './order-list.reducer';

export const selectOrderList = selectOrdersSlice<OrderListState>();

export const selectOrderById = (orderId: string) =>
    createSelector(
        selectOrderList,
        (orders): OrderEntryDTO | undefined => orders.find(order => order.id === orderId)
    );
