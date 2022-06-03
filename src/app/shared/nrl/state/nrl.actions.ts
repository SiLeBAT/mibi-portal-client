import { createAction, props } from '@ngrx/store';
import { NRLDTO } from '../../../core/model/response.model';

export const nrlUpdateNrlsSOA = createAction(
    '[NRL] Populate nrls',
    props<{ nrlDTO: NRLDTO[] }>()
);
