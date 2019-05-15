import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserActions, UserActionTypes } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';
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

// SELECTORS
export const getUserFeatureState = createFeatureSelector<UserState>(STATE_SLICE_NAME);

export const selectCurrentUser = createSelector(
    getUserFeatureState,
    state => state.currentUser
);

export const selectInstitutions = createSelector(
    getUserFeatureState,
    state => state.institutes
);

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
