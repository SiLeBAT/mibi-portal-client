import { selectOrdersSlice } from '../orders.state';
import { OrderListState } from './order-list.reducer';

export const selectOrderList = selectOrdersSlice<OrderListState>();
