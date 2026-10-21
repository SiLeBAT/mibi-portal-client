import { Action, ActionReducerMap } from '@ngrx/store';
import { UserMainState, userCurrentUserReducer, userInstitutesReducer } from './state/user.reducer';
import { UserMainEffects } from './user.effects';
import { UserRecoverPasswordEffects } from './recover-password/recover-password.effects';
import { UserRegisterEffects } from './register/register.effects';
import { UserResetPasswordEffects } from './reset-password/reset-password.effects';
import { UserAuthGuardEffects } from './auth-guard/auth-guard.effects';

type UserState = UserMainState;

export const userReducerMap: ActionReducerMap<UserState, Action> = {
    currentUser: userCurrentUserReducer,
    institutes: userInstitutesReducer
};

export const userEffects = [
    UserMainEffects,
    UserRecoverPasswordEffects,
    UserRegisterEffects,
    UserResetPasswordEffects,
    UserAuthGuardEffects
];
