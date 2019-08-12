import { ActionReducerMap } from '@ngrx/store';
import { UserMainState, userCurrentUserReducer, userInstitutesReducer } from './state/user.reducer';
import { UserMainAction } from './state/user.actions';
import { UserMainEffects } from './user.effects';

type UserState = UserMainState;
type UserReducerAction = UserMainAction;

export const userReducerMap: ActionReducerMap<UserState, UserReducerAction> = {
    currentUser: userCurrentUserReducer,
    institutes: userInstitutesReducer
};

export const userEffects = [
    UserMainEffects
];
