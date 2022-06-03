import { createAction, props } from '@ngrx/store';
import { SupportDetail } from '../model/support-detail.model';

export const updateSupportDetailSOA = createAction(
    '[Content] Update Support detail',
    props<{ supportDetail: SupportDetail }>()
);
