import { NRLDTO } from '../../../core/model/response.model';
import * as _ from 'lodash';
import { NRLMainActionTypes, NRLMainAction } from './nrl.actions';

// STATE

export interface NRLState {
    nrls: NRLDTO[];
}

// REDUCER
export function NRLReducer(state: NRLDTO[] = [], action: NRLMainAction): NRLDTO[] {
    switch (action.type) {
        case NRLMainActionTypes.UpdateNRLsSOA:
            return _.cloneDeep(action.payload);
        default:
            return state;
    }
}
