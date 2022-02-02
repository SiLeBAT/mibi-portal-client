import { NRLDTO } from '../../../core/model/response.model';
import _ from 'lodash-es';
import { nrlUpdateNrlsSOA } from './nrl.actions';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface NrlState {
    nrls: NRLDTO[];
}

// REDUCER
export const nrlReducer = createReducer(
    [],
    on(nrlUpdateNrlsSOA, (state, action) => action.nrlDTO)
);
