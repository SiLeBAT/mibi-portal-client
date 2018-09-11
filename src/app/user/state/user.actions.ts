import { ICredentials, IUser } from '../model/models';
import { Action } from '@ngrx/store';
import { IAlert } from '../../core/model/alert.model';

export enum UserActionTypes {
    LoginUser = '[User] Log in user',
    LoginUserSuccess = '[User] Successfully logged in user',
    LoginUserFailure = '[User] Failure logging in user',
    LogoutUser = '[User] Log out user'
}

export class LoginUser implements Action {
    readonly type = UserActionTypes.LoginUser;

    constructor(public payload: ICredentials) {

    }
}

export class LoginUserSuccess implements Action {
    readonly type = UserActionTypes.LoginUserSuccess;

    constructor(public payload: IUser) {

    }
}

export class LoginUserFailure implements Action {
    readonly type = UserActionTypes.LoginUserFailure;

    constructor(public payload: IAlert) {

    }
}

export class LogoutUser implements Action {
    readonly type = UserActionTypes.LogoutUser;

    constructor() {

    }
}

export type UserActions = LoginUser
    | LoginUserSuccess
    | LoginUserFailure
    | LogoutUser;
