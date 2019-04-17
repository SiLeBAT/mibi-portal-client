import { Credentials, TokenizedUser } from '../model/user.model';
import { Action } from '@ngrx/store';
import { InstitutionDTO } from '../model/institution.model';

export enum UserActionTypes {
    LoginUser = '[User] Log in user',
    LoginUserSuccess = '[User] Successfully logged in user',
    LogoutUser = '[User] Log out user',
    PopulateInstitutions = '[User] Populate institutions'
}

export class LoginUser implements Action {
    readonly type = UserActionTypes.LoginUser;

    constructor(public payload: Credentials) {

    }
}

export class LoginUserSuccess implements Action {
    readonly type = UserActionTypes.LoginUserSuccess;

    constructor(public payload: TokenizedUser) {

    }
}

export class LogoutUser implements Action {
    readonly type = UserActionTypes.LogoutUser;

    constructor() {

    }
}

export class PopulateInstitutions implements Action {
    readonly type = UserActionTypes.PopulateInstitutions;

    constructor(public payload: InstitutionDTO[]) {

    }
}

export type UserActions = LoginUser
    | LoginUserSuccess
    | LogoutUser
    | PopulateInstitutions;
