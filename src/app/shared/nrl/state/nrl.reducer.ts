import { NRLDTO } from '../../../core/model/response.model';
import { nrlUpdateNrlsSOA } from './nrl.actions';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface NrlState {
    nrls: NRLDTO[];
}

// REDUCER
export const nrlReducer = createReducer<NRLDTO[]>(
    [],
    on(nrlUpdateNrlsSOA, (_state, action) => action.nrlDTO)
);
