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
import { UserActionType } from '../../shared/model/user-action.model';
import { BannerState } from './core.reducer';
import { DialogContent } from '../model/dialog.model';

export enum CoreActionTypes {
    DisplayBanner = '[Core] Display Banner',
    DisplayDialog = '[Core] Display Dialog',
    DestroyBanner = '[Core] Destroy Banner',
    HideBanner = '[Core] Hide Banner',
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
        this.payload = { ...this.payload, ...{ show: true } };

    }
}
export class EnableActionItems implements Action {
    readonly type = CoreActionTypes.EnableActionItems;

    constructor(public payload: UserActionType[]) {

    }
}

export class DestroyBanner implements Action {
    readonly type = CoreActionTypes.DestroyBanner;

    constructor() {

    }
}

export class HideBanner implements Action {
    readonly type = CoreActionTypes.HideBanner;

    constructor() {

    }
}

// TODO: Is this correct?
export type SystemActions = ValidateSamples
    | ValidateSamplesSuccess
    | DisplayDialog
    | HideBanner
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | DisplayBanner
    | DestroyBanner
    | EnableActionItems
    | LoginUser
    | LoginUserSuccess
    | RouterNavigationAction;
