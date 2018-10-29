import {
    ValidateSamples,
    ValidateSamplesSuccess,
    ExportExcelFile,
    ExportExcelFileSuccess,
    ExportExcelFileFailure,
 SendSamplesConfirm, SendSamplesInitiate, ImportExcelFile, ImportExcelFileSuccess
} from '../../samples/state/samples.actions';
import { Action } from '@ngrx/store';
import { IAlert } from '../model/alert.model';
import {
    LoginUser,
    LoginUserSuccess
} from '../../user/state/user.actions';
import { RouterNavigationAction } from '@ngrx/router-store';

export enum CoreActionTypes {
    DisplayAlert = '[Core] Display Alert',
    ClearAlert = '[Core] Clear Alert'
}
export class DisplayAlert implements Action {
    readonly type = CoreActionTypes.DisplayAlert;

    constructor(public payload: IAlert) {

    }
}

export class ClearAlert implements Action {
    readonly type = CoreActionTypes.ClearAlert;

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
    | DisplayAlert
    | ClearAlert
    | LoginUser
    | LoginUserSuccess
    | RouterNavigationAction;
