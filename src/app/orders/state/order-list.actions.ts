import { createAction, props } from '@ngrx/store';
import { OrderEntryDTO } from '../../core/model/response.model';

export const orderListUpdateSOA = createAction(
    '[OrderList] Populate order list',
    props<{ orders: OrderEntryDTO[] }>()
);

export const orderListDestroySOA = createAction(
    '[OrderList] Delete order list'
);
