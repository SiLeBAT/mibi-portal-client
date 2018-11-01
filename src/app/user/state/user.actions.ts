import { Credentials, User } from '../model/user.model';
import { Action } from '@ngrx/store';

export enum UserActionTypes {
    LoginUser = '[User] Log in user',
    LoginUserSuccess = '[User] Successfully logged in user',
    LogoutUser = '[User] Log out user'
}

export class LoginUser implements Action {
    readonly type = UserActionTypes.LoginUser;

    constructor(public payload: Credentials) {

    }
}

export class LoginUserSuccess implements Action {
    readonly type = UserActionTypes.LoginUserSuccess;

    constructor(public payload: User) {

    }
}

export class LogoutUser implements Action {
    readonly type = UserActionTypes.LogoutUser;

    constructor() {

    }
}

export type UserActions = LoginUser
    | LoginUserSuccess
    | LogoutUser;
