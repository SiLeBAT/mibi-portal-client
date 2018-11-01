import { Action } from '@ngrx/store';
import { IAnnotatedSampleData, ISampleSheet, IExcelData, IChangedDataGridField } from '../model/sample-management.model';
import { Alert } from '../../core/model/alert.model';
import { LogoutUser } from '../../user/state/user.actions';
import { DialogContent } from '../../core/model/dialog.model';
import { IUser } from '../../user/model/user.model';
import { IValidationRequest } from '../../core/model/request.model';

export enum SamplesActionTypes {
    ImportExcelFile = '[Samples] Import Excel file',
    ImportExcelFileSuccess = '[Samples] Successfully imported Excel file',
    ExportExcelFile = '[Samples] Export Excel file',
    ExportExcelFileSuccess = '[Samples] Successfully exported Excel file',
    ExportExcelFileFailure = '[Samples] Failure exporting Excel file',
    ValidateSamples = '[Samples] Validate samples',
    ValidateSamplesSuccess = '[Samples] Successfully validated samples',
    SendSamplesInitiate = '[Samples] Initiating sending samples',
    SendSamplesFromStore = '[Samples] Send samples from store',
    SendSamplesConfirm = '[Samples] Confirm sending samples',
    ChangeFieldValue = '[Samples] Change field value'
}

export class ChangeFieldValue implements Action {
    readonly type = SamplesActionTypes.ChangeFieldValue;

    constructor(public payload: IChangedDataGridField) {

    }
}

export class ImportExcelFile implements Action {
    readonly type = SamplesActionTypes.ImportExcelFile;

    constructor(public payload: File) {

    }
}

export class ImportExcelFileSuccess implements Action {
    readonly type = SamplesActionTypes.ImportExcelFileSuccess;

    constructor(public payload: IExcelData) {

    }
}

export class ExportExcelFile implements Action {
    readonly type = SamplesActionTypes.ExportExcelFile;

    constructor(public payload: ISampleSheet) {
    }
}

export class ExportExcelFileSuccess implements Action {
    readonly type = SamplesActionTypes.ExportExcelFileSuccess;

    constructor() {
    }
}

export class ExportExcelFileFailure implements Action {
    readonly type = SamplesActionTypes.ExportExcelFileFailure;

    constructor(public payload: Alert) {
    }
}

export class ValidateSamples implements Action {
    readonly type = SamplesActionTypes.ValidateSamples;

    constructor(public payload: IValidationRequest) {

    }
}

export class ValidateSamplesSuccess implements Action {
    readonly type = SamplesActionTypes.ValidateSamplesSuccess;

    constructor(public payload: IAnnotatedSampleData[]) {

    }
}

export class SendSamplesInitiate implements Action {
    readonly type = SamplesActionTypes.SendSamplesInitiate;

    constructor(public payload: IValidationRequest) {

    }
}

export class SendSamplesFromStore implements Action {
    readonly type = SamplesActionTypes.SendSamplesFromStore;

    constructor(public payload: IUser) {
    }
}

export class SendSamplesConfirm implements Action {
    readonly type = SamplesActionTypes.SendSamplesConfirm;

    constructor(public payload: DialogContent) {
    }
}

export type SamplesActions = ImportExcelFile
    | ImportExcelFileSuccess
    | ValidateSamples
    | ValidateSamplesSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | SendSamplesFromStore
    | SendSamplesConfirm
    | ChangeFieldValue
    | LogoutUser;
