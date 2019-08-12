import { Credentials, TokenizedUser } from '../model/user.model';
import { Action } from '@ngrx/store';
import { InstitutionDTO } from '../model/institution.model';

export enum UserMainActionTypes {
    LoginUser = '[User] Log in user',
    LoginUserSuccess = '[User] Successfully logged in user',
    LogoutUser = '[User] Log out user',
    PopulateInstitutions = '[User] Populate institutions'
}

export class LoginUser implements Action {
    readonly type = UserMainActionTypes.LoginUser;

    constructor(public payload: Credentials) {

    }
}

export class LoginUserSuccess implements Action {
    readonly type = UserMainActionTypes.LoginUserSuccess;

    constructor(public payload: TokenizedUser) {

    }
}

export class LogoutUser implements Action {
    readonly type = UserMainActionTypes.LogoutUser;

    constructor() {

    }
}

export class PopulateInstitutions implements Action {
    readonly type = UserMainActionTypes.PopulateInstitutions;

    constructor(public payload: InstitutionDTO[]) {

    }
}

export type UserMainAction = LoginUser
    | LoginUserSuccess
    | LogoutUser
    | PopulateInstitutions;
