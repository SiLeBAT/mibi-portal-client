import {
    ValidateSamples,
    ValidateSamplesSuccess,
    ExportExcelFile,
    ExportExcelFileSuccess,
    ExportExcelFileFailure,
 SendSamplesConfirm, SendSamplesInitiate, ImportExcelFile, ImportExcelFileSuccess
} from '../../samples/state/samples.actions';
import { Action } from '@ngrx/store';
import {
    LoginUser,
    LoginUserSuccess
} from '../../user/state/user.actions';
import { RouterNavigationAction } from '@ngrx/router-store';
import { ActionItemType } from '../model/action-items.model';
import { BannerState } from './core.reducer';

export enum CoreActionTypes {
    DisplayBanner = '[Core] Display Banner',
    ClearBanner = '[Core] Clear Banner',
    EnableActionItems = '[Core] Enable Action Items'
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
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | SendSamplesConfirm
    | DisplayBanner
    | ClearBanner
    | EnableActionItems
    | LoginUser
    | LoginUserSuccess
    | RouterNavigationAction;
