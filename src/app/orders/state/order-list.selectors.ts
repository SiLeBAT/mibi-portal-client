import { createSelector } from '@ngrx/store';
import { OrderEntryDTO } from '../../core/model/response.model';
import { selectOrdersSlice } from '../orders.state';
import { OrderListState } from './order-list.reducer';

const selectOrderListState = selectOrdersSlice<OrderListState>();

export const selectOrderList = createSelector(
    selectOrderListState,
    (state): OrderEntryDTO[] => state.orders
);

/** Order ids in the sequence the order list table currently displays. */
export const selectOrderSequence = createSelector(
    selectOrderListState,
    (state): string[] => state.sequence
);

export const selectOrderById = (orderId: string) =>
    createSelector(
        selectOrderList,
        (orders): OrderEntryDTO | undefined => orders.find(order => order.id === orderId)
    );

export interface OrderNeighbours {
    newerOrderId: string | null;
    olderOrderId: string | null;
}

/**
 * Ids of the neighbouring orders, following the sequence the order list table
 * currently displays (its sorting/filtering), falling back to the stored order
 * list. The entry before the current one counts as "newer", the one after as
 * "older".
 */
export const selectOrderNeighbours = (orderId: string) =>
    createSelector(
        selectOrderList,
        selectOrderSequence,
        (orders, sequence): OrderNeighbours => {
            const orderIds = sequence.length > 0 ? sequence : orders.map(order => order.id);
            const index = orderIds.indexOf(orderId);
            if (index < 0) {
                return { newerOrderId: null, olderOrderId: null };
            }
            return {
                newerOrderId: orderIds[index - 1] ?? null,
                olderOrderId: orderIds[index + 1] ?? null
            };
        }
    );
