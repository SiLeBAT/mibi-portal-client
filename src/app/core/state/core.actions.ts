import {
    ValidateSamples,
    ValidateSamplesSuccess,
    ValidateSamplesFailure,
    ExportExcelFile,
    ExportExcelFileSuccess,
    ExportExcelFileFailure,
    SendSamplesSuccess,
    SendSamplesFailure, SendSamplesConfirm, SendSamplesInitiate, ImportExcelFile, ImportExcelFileSuccess, ImportExcelFileFailure
} from '../../samples/state/samples.actions';
import { Action } from '@ngrx/store';
import { IAlert } from '../model/alert.model';
import {
    LoginUser,
    LoginUserFailure,
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
    | ValidateSamplesFailure
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ImportExcelFileFailure
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | SendSamplesSuccess
    | SendSamplesFailure
    | SendSamplesConfirm
    | DisplayAlert
    | ClearAlert
    | LoginUser
    | LoginUserFailure
    | LoginUserSuccess
    | RouterNavigationAction;
