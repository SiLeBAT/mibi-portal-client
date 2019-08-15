import { UserMainAction, UserMainActionTypes } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';
import * as _ from 'lodash';

// STATE

export interface UserMainState {
    currentUser: TokenizedUser | null;
    institutes: InstitutionDTO[];
}

// REDUCER

export function userCurrentUserReducer(state: TokenizedUser | null = null, action: UserMainAction): TokenizedUser | null {
    switch (action.type) {
        case UserMainActionTypes.UpdateCurrentUserSOA:
            return _.cloneDeep(action.payload);
        case UserMainActionTypes.DestroyCurrentUserSOA:
            return null;
        default:
            return state;
    }
}

export function userInstitutesReducer(state: InstitutionDTO[] = [], action: UserMainAction): InstitutionDTO[] {
    switch (action.type) {
        case UserMainActionTypes.PopulateInstitutions:
            return _.cloneDeep(action.payload);
        default:
            return state;
    }
}
