import { Action } from '@ngrx/store';
import { NRLDTO } from '../../../core/model/response.model';

export enum NRLMainActionTypes {
    UpdateNRLsSOA = '[NRL] Populate nrls'
}

export class UpdateNRLsSOA implements Action {
    readonly type = NRLMainActionTypes.UpdateNRLsSOA;

    constructor(public payload: NRLDTO[]) { }
}

export type NRLMainAction =
    UpdateNRLsSOA;
