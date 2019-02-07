import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserActions, UserActionTypes } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';
export const STATE_SLICE_NAME = 'user';

export interface State extends fromRoot.State {
    user: IUserState;
}

export interface IUserState {
    currentUser: TokenizedUser | null;
    institutes: InstitutionDTO[];
}

const initialState: IUserState = {
    currentUser: retrieveUserFromLocalStorage(),
    institutes: []
};

// SELECTORS
export const getUserFeatureState = createFeatureSelector<IUserState>(STATE_SLICE_NAME);

export const getCurrentUser = createSelector(
    getUserFeatureState,
    state => state.currentUser
);

export const getInstitutions = createSelector(
    getUserFeatureState,
    state => state.institutes
);

// REDUCER
export function reducer(state: IUserState = initialState, action: UserActions): IUserState {
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

// Utilities

function retrieveUserFromLocalStorage(): TokenizedUser | null {
    const cu: string | null = localStorage.getItem('currentUser');
    if (!cu) {
        return null;
    }
    return JSON.parse(cu);
}
