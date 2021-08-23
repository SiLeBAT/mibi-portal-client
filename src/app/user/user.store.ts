import { Action, ActionReducerMap } from '@ngrx/store';
import { UserMainState, userCurrentUserReducer, userInstitutesReducer } from './state/user.reducer';
import { UserMainEffects } from './user.effects';

type UserState = UserMainState;

export const userReducerMap: ActionReducerMap<UserState, Action> = {
    currentUser: userCurrentUserReducer,
    institutes: userInstitutesReducer
};

export const userEffects = [
    UserMainEffects
];
