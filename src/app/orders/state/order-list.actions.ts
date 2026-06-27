import { createAction, props } from '@ngrx/store';
import { OrderEntryDTO, SampleWithResultsDTO } from '../../core/model/response.model';

export const orderListUpdateSOA = createAction(
    '[OrderList] Populate order list',
    props<{ orders: OrderEntryDTO[] }>()
);

export const orderListDestroySOA = createAction(
    '[OrderList] Delete order list'
);

export const orderListLoadSamplesWithResultsSOA = createAction(
    '[OrderList] Load samples with results',
    props<{ orderId: string }>()
);

export const orderListAddSamplesWithResultsSOA = createAction(
    '[OrderList] Add samples with results',
    props<{ orderId: string; samples: SampleWithResultsDTO[] }>()
);
