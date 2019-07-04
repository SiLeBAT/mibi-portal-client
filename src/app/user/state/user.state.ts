import { UserActions, UserActionTypes } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';

// STATE

export const STATE_SLICE_NAME = 'user';

export interface UserMainState {
    user: UserState;
}

export interface UserState {
    currentUser: TokenizedUser | null;
    institutes: InstitutionDTO[];
}

const initialState: UserState = {
    currentUser: null,
    institutes: []
};

// REDUCER

export function reducer(state: UserState = initialState, action: UserActions): UserState {
    switch (action.type) {
        case UserActionTypes.PopulateInstitutions:
            return {
                ...state,
                ...{
                    institutes: action.payload
                }
            };
        case UserActionTypes.LoginUserSuccess:
            return {
                ...state,
                ...{
                    currentUser: action.payload
                }
            };
        case UserActionTypes.LogoutUser:
            return {
                ...state,
                ...{
                    currentUser: null
                }
            };
        default:
            return state;
    }
}
