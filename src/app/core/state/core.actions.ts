import { Action } from '@ngrx/store';
import { DialogContent } from '../model/dialog.model';
import { UserActionType } from '../../shared/model/user-action.model';
import { Banner, BannerType } from '../model/alert.model';

export enum CoreMainActionTypes {
    ShowBannerSOA = '[Core] Create and show Banner',
    ShowCustomBannerSOA = '[Core] Create and show Custom Banner',
    HideBannerSOA = '[Core] Hide Banner',
    DestroyBannerSOA = '[Core] Destroy Banner',
    ShowActionBarSOA = '[Core] Show Action Bar',
    UpdateActionBarTitleSOA = '[Core] Update Action Bar Title',
    ShowDialogMSA = '[Core] Display Dialog',
    UpdateIsBusySOA = '[Core] Show or hide Busy Spinner'
}

export class ShowBannerSOA implements Action {
    readonly type = CoreMainActionTypes.ShowBannerSOA;

    constructor(public payload: { predefined: BannerType }) { }
}

export class ShowCustomBannerSOA implements Action {
    readonly type = CoreMainActionTypes.ShowCustomBannerSOA;

    constructor(public payload: { banner: Banner }) { }
}

export class HideBannerSOA implements Action {
    readonly type = CoreMainActionTypes.HideBannerSOA;
}

export class DestroyBannerSOA implements Action {
    readonly type = CoreMainActionTypes.DestroyBannerSOA;
}

export class ShowActionBarSOA implements Action {
    readonly type = CoreMainActionTypes.ShowActionBarSOA;

    constructor(public payload: {title: string, enabledActions: UserActionType[]}) { }
}

export class UpdateActionBarTitleSOA implements Action {
    readonly type = CoreMainActionTypes.UpdateActionBarTitleSOA;

    constructor(public payload: {title: string}) { }
}

export class ShowDialogMSA implements Action {
    readonly type = CoreMainActionTypes.ShowDialogMSA;

    constructor(public payload: DialogContent) { }
}

export class UpdateIsBusySOA implements Action {
    readonly type = CoreMainActionTypes.UpdateIsBusySOA;

    constructor(public payload: { isBusy: boolean }) { }
}

export type CoreMainAction =
    | ShowBannerSOA
    | ShowCustomBannerSOA
    | HideBannerSOA
    | DestroyBannerSOA
    | ShowActionBarSOA
    | UpdateActionBarTitleSOA
    | ShowDialogMSA
    | UpdateIsBusySOA;
