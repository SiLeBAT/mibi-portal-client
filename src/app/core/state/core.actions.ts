import { UUID } from 'angular2-uuid';
import { Action } from '@ngrx/store';
import { DialogContent } from '../model/dialog.model';
import { BannerData } from './core.reducer';
import { UserActionType } from '../../shared/model/user-action.model';

export enum CoreMainActionTypes {
    ShowBannerSOA = '[Core] Create and show Banner',
    HideBannerSOA = '[Core] Hide Banner',
    DestroyBannerSOA = '[Core] Destroy Banner',
    ShowActionBarSOA = '[Core] Show Action Bar',
    UpdateActionBarTitleSOA = '[Core] Update Action Bar Title',
    ShowDialogMSA = '[Core] Display Dialog',
    UpdateIsBusySOA = '[Core] Show or hide Busy Spinner'
}

export class ShowBannerSOA implements Action {
    readonly type = CoreMainActionTypes.ShowBannerSOA;

    constructor(public payload: BannerData) {
        this.payload = { ...this.payload, ...{ show: true, id: UUID.UUID() } };
    }
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
    | HideBannerSOA
    | DestroyBannerSOA
    | ShowActionBarSOA
    | UpdateActionBarTitleSOA
    | ShowDialogMSA
    | UpdateIsBusySOA;
