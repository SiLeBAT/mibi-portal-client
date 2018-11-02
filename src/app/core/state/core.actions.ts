import {
    ValidateSamples,
    ValidateSamplesSuccess,
    ExportExcelFile,
    ExportExcelFileSuccess,
    ExportExcelFileFailure,
    SendSamplesInitiate, ImportExcelFile, ImportExcelFileSuccess
} from '../../samples/state/samples.actions';
import { Action } from '@ngrx/store';
import {
    LoginUser,
    LoginUserSuccess
} from '../../user/state/user.actions';
import { RouterNavigationAction } from '@ngrx/router-store';
import { ActionItemType } from '../model/action-items.model';
import { BannerState } from './core.reducer';
import { DialogContent } from '../model/dialog.model';

export enum CoreActionTypes {
    DisplayBanner = '[Core] Display Banner',
    DisplayDialog = '[Core] Display Dialog',
    ClearBanner = '[Core] Clear Banner',
    EnableActionItems = '[Core] Enable Action Items'
}
export class DisplayDialog implements Action {
    readonly type = CoreActionTypes.DisplayDialog;

    constructor(public payload: DialogContent) {

    }
}

export class DisplayBanner implements Action {
    readonly type = CoreActionTypes.DisplayBanner;

    constructor(public payload: BannerState) {

    }
}
export class EnableActionItems implements Action {
    readonly type = CoreActionTypes.EnableActionItems;

    constructor(public payload: ActionItemType[]) {

    }
}

export class ClearBanner implements Action {
    readonly type = CoreActionTypes.ClearBanner;

    constructor() {

    }
}

// TODO: Is this correct?
export type SystemActions = ValidateSamples
    | ValidateSamplesSuccess
    | DisplayDialog
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | DisplayBanner
    | ClearBanner
    | EnableActionItems
    | LoginUser
    | LoginUserSuccess
    | RouterNavigationAction;
