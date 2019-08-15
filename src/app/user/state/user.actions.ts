import { Credentials, TokenizedUser } from '../model/user.model';
import { Action } from '@ngrx/store';
import { InstitutionDTO } from '../model/institution.model';

export enum UserMainActionTypes {
    LoginUserSSA = '[User] Log in user',
    LogoutUserMSA = '[User] Log out user',
    DestroyCurrentUserSOA = '[User] Delete current user',
    UpdateCurrentUserSOA = '[User] Store tokenized user',
    UpdateInstitutionsSOA = '[User] Populate institutions'
}

export class LoginUserSSA implements Action {
    readonly type = UserMainActionTypes.LoginUserSSA;

    constructor(public payload: Credentials) { }
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

export type UserMainAction =
    LoginUserSSA
    | LogoutUserMSA
    | UpdateCurrentUserSOA
    | DestroyCurrentUserSOA
    | UpdateInstitutionsSOA;
