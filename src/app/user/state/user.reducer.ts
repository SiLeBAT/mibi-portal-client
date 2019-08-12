import { UserMainAction, UserMainActionTypes } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';
import * as _ from 'lodash';

// STATE

export interface UserMainState {
    currentUser: CurrentUser;
    institutes: InstitutionDTO[];
}

export type CurrentUser = TokenizedUser | null;

// REDUCER

export function userCurrentUserReducer(state: CurrentUser = null, action: UserMainAction): CurrentUser {
    switch (action.type) {
        case UserMainActionTypes.LoginUserSuccess:
            return _.cloneDeep(action.payload);
        case UserMainActionTypes.LogoutUser:
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
