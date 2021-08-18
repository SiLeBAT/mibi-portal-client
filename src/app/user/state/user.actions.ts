import { Credentials, TokenizedUser } from '../model/user.model';
import { Action } from '@ngrx/store';
import { InstitutionDTO } from '../model/institution.model';

export enum UserMainActionTypes {
    UserLoginSSA = '[User] Login user',
    UserLogoutMSA = '[User] Logout user',
    UserForceLogoutMSA = '[User] Force logout user',
    UserUpdateCurrentUserSOA = '[User] Store tokenized user',
    UserDestroyCurrentUserSOA = '[User] Delete current user',
    UserUpdateInstitutionsSOA = '[User] Populate institutions'
}

export class UserLoginSSA implements Action {
    readonly type = UserMainActionTypes.UserLoginSSA;

    constructor(public payload: Credentials) { }
}

export class UserLogoutMSA implements Action {
    readonly type = UserMainActionTypes.UserLogoutMSA;
}

export class UserForceLogoutMSA implements Action {
    readonly type = UserMainActionTypes.UserForceLogoutMSA;
}

export class UserUpdateCurrentUserSOA implements Action {
    readonly type = UserMainActionTypes.UserUpdateCurrentUserSOA;

    constructor(public payload: TokenizedUser) { }
}

export class UserDestroyCurrentUserSOA implements Action {
    readonly type = UserMainActionTypes.UserDestroyCurrentUserSOA;
}

export class UserUpdateInstitutionsSOA implements Action {
    readonly type = UserMainActionTypes.UserUpdateInstitutionsSOA;

    constructor(public payload: InstitutionDTO[]) { }
}

export type UserMainAction =
    UserLoginSSA
    | UserLogoutMSA
    | UserForceLogoutMSA
    | UserUpdateCurrentUserSOA
    | UserDestroyCurrentUserSOA
    | UserUpdateInstitutionsSOA;
