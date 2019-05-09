import { UUID } from 'angular2-uuid';
import { Action } from '@ngrx/store';
import { UserActionType } from '../../shared/model/user-action.model';
import { BannerState } from './core.reducer';
import { DialogContent } from '../model/dialog.model';

export enum CoreMainActionTypes {
    DisplayBanner = '[Core] Display Banner',
    DisplayDialog = '[Core] Display Dialog',
    DestroyBanner = '[Core] Destroy Banner',
    HideBanner = '[Core] Hide Banner',
    EnableActionItems = '[Core] Enable Action Items'
}
export class DisplayDialog implements Action {
    readonly type = CoreMainActionTypes.DisplayDialog;

    constructor(public payload: DialogContent) { }
}

export class DisplayBanner implements Action {
    readonly type = CoreMainActionTypes.DisplayBanner;

    constructor(public payload: BannerState) {
        this.payload = { ...this.payload, ...{ show: true, id: UUID.UUID() } };
    }
}

export class EnableActionItems implements Action {
    readonly type = CoreMainActionTypes.EnableActionItems;

    constructor(public payload: UserActionType[]) { }
}

export class DestroyBanner implements Action {
    readonly type = CoreMainActionTypes.DestroyBanner;
}

export class HideBanner implements Action {
    readonly type = CoreMainActionTypes.HideBanner;
}

export type CoreMainAction =
    | DisplayDialog
    | HideBanner
    | DisplayBanner
    | DestroyBanner
    | EnableActionItems;
