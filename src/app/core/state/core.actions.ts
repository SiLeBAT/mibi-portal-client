import { UUID } from 'angular2-uuid';
import { Action } from '@ngrx/store';
import { UserActionType } from '../../shared/model/user-action.model';
import { DialogContent } from '../model/dialog.model';
import { BannerData } from './core.reducer';

export enum CoreMainActionTypes {
    DisplayBannerSOA = '[Core] Create and show Banner',
    HideBannerSOA = '[Core] Hide Banner',
    DestroyBannerSOA = '[Core] Destroy Banner',
    UpdateActionItemsSOA = '[Core] Create and enable Action Items',
    DisplayDialogMSA = '[Core] Display Dialog',
    UpdateIsBusySOA = '[Core] Show or hide Busy Spinner'
}

export class DisplayBannerSOA implements Action {
    readonly type = CoreMainActionTypes.DisplayBannerSOA;

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

export class UpdateActionItemsSOA implements Action {
    readonly type = CoreMainActionTypes.UpdateActionItemsSOA;

    constructor(public payload: UserActionType[]) { }
}

export class DisplayDialogMSA implements Action {
    readonly type = CoreMainActionTypes.DisplayDialogMSA;

    constructor(public payload: DialogContent) { }
}

export class UpdateIsBusySOA implements Action {
    readonly type = CoreMainActionTypes.UpdateIsBusySOA;

    constructor(public payload: boolean) {}
}

export type CoreMainAction =
    | DisplayBannerSOA
    | HideBannerSOA
    | DestroyBannerSOA
    | UpdateActionItemsSOA
    | DisplayDialogMSA
    | UpdateIsBusySOA;
