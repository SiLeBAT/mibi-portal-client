import { Credentials, TokenizedUser, User, UserState } from '../model/user.model';
import { Action } from '@ngrx/store';
import { InstitutionDTO } from '../model/institution.model';


export enum UserMainActionTypes {
    UpdateUserStateSOA = '[User] Update user state',
    LoginUserMSA = '[User] Log in user',
    LogoutUserMSA = '[User] Logout user',
    DestroyCurrentUserSOA = '[User] Delete current user',
    UpdateCurrentUserSOA = '[User] Store tokenized user',
    UpdateInstitutionsSOA = '[User] Populate institutions',
    CheckAuthMSA = '[User] Check authentication',
    UpdateAuthSSA = '[User] Update authentication',
    RequestLogoutSSA = '[User] Request logout',
    LoginSSA = '[User] Login',
    LogoutSSA = '[User] Logout',
    RedirectUserMSA = '[User] Redirect User',
}

export class UpdateUserStateSOA implements Action {
    readonly type = UserMainActionTypes.UpdateUserStateSOA;

    constructor(public payload: {state: UserState}){}
}

export class CheckAuthMSA implements Action {
    readonly type = UserMainActionTypes.CheckAuthMSA;
}

export class UpdateAuthSSA implements Action {
    readonly type = UserMainActionTypes.UpdateAuthSSA;

    constructor(public payload: {userInfo: TokenizedUser | null}){}
}

export class RequestLogoutSSA implements Action {
    readonly type = UserMainActionTypes.RequestLogoutSSA;

    constructor(public payload: {currentUser: TokenizedUser, userChanged: boolean}){}
}

export class LoginSSA implements Action {
    readonly type = UserMainActionTypes.LoginSSA;

    constructor(public payload: TokenizedUser) {}
}

export class LogoutSSA implements Action {
    readonly type = UserMainActionTypes.LogoutSSA;
}

export class LoginUserMSA implements Action {
    readonly type = UserMainActionTypes.LoginUserMSA;

    // constructor(public payload: Credentials) { }
}

export class LogoutUserMSA implements Action {
    readonly type = UserMainActionTypes.LogoutUserMSA;
}

export class UpdateCurrentUserSOA implements Action {
    readonly type = UserMainActionTypes.UpdateCurrentUserSOA;

    constructor(public payload: TokenizedUser) { }
}

export class DestroyCurrentUserSOA implements Action {
    readonly type = UserMainActionTypes.DestroyCurrentUserSOA;
}

export class UpdateInstitutionsSOA implements Action {
    readonly type = UserMainActionTypes.UpdateInstitutionsSOA;

    constructor(public payload: InstitutionDTO[]) { }
}

export class RedirectUserMSA implements Action {
    readonly type = UserMainActionTypes.RedirectUserMSA;

    constructor(public payload: {url: string}) {}
}

export type UserMainAction =
    UpdateUserStateSOA
    | CheckAuthMSA
    | UpdateAuthSSA
    | RequestLogoutSSA
    | LoginSSA
    | LogoutSSA
    | LoginUserMSA
    | LogoutUserMSA
    | RedirectUserMSA
    | UpdateCurrentUserSOA
    | DestroyCurrentUserSOA
    | UpdateInstitutionsSOA;
