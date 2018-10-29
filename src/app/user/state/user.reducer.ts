import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserActions, UserActionTypes } from './user.actions';
import { IUser } from '../model/user.model';
export const STATE_SLICE_NAME = 'user';
export interface IState extends fromRoot.State {
    user: IUserState;
}

export interface IUserState {
    currentUser: IUser | null;
}

const initialState: IUserState = {
    currentUser: null
};

// SELECTORS
export const getUserFeatureState = createFeatureSelector<IUserState>(STATE_SLICE_NAME);

export const getCurrentUser = createSelector(
    getUserFeatureState,
    state => state.currentUser
);

// REDUCER
export function reducer(state: IUserState = initialState, action: UserActions): IUserState {
    switch (action.type) {
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
