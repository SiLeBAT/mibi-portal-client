import {
    ExportExcelFile,
    ExportExcelFileSuccess,
    ExportExcelFileFailure,
    ImportExcelFile, ImportExcelFileSuccess
} from '../../samples/state/samples.actions';
import { UUID } from 'angular2-uuid';
import { Action } from '@ngrx/store';
import {
    LoginUser,
    LoginUserSuccess
} from '../../user/state/user.actions';
import { RouterNavigationAction } from '@ngrx/router-store';
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

    constructor(public payload: DialogContent) {

    }
}

export class DisplayBanner implements Action {
    readonly type = CoreMainActionTypes.DisplayBanner;

    constructor(public payload: BannerState) {
        this.payload = { ...this.payload, ...{ show: true, id: UUID.UUID() } };

    }
}
export class EnableActionItems implements Action {
    readonly type = CoreMainActionTypes.EnableActionItems;

    constructor(public payload: UserActionType[]) {

    }
}

export class DestroyBanner implements Action {
    readonly type = CoreMainActionTypes.DestroyBanner;

    constructor() {

    }
}

export class HideBanner implements Action {
    readonly type = CoreMainActionTypes.HideBanner;

    constructor() {

    }
}

// TODO: Is this correct? => NO
export type CoreMainAction =
    | DisplayDialog
    | HideBanner
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | DisplayBanner
    | DestroyBanner
    | EnableActionItems
    | LoginUser
    | LoginUserSuccess
    | RouterNavigationAction;
