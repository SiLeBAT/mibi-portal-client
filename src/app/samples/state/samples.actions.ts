import { Action } from '@ngrx/store';
import { IAnnotatedSampleData, ISampleSheet, IExcelData, IChangedDataGridField } from '../model/sample-management.model';
import { IAlert } from '../../core/model/alert.model';
import { LogoutUser } from '../../user/state/user.actions';
import { IModalContent } from '../../core/model/modal.model';
import { IUser } from '../../user/model/user.model';
import { IValidationRequest } from '../../core/model/request.model';

export enum SamplesActionTypes {
    ImportExcelFile = '[Samples] Import Excel file',
    ImportExcelFileSuccess = '[Samples] Successfully imported Excel file',
    ImportExcelFileFailure = '[Samples] Failure importing Excel file',
    ExportExcelFile = '[Samples] Export Excel file',
    ExportExcelFileSuccess = '[Samples] Successfully exported Excel file',
    ExportExcelFileFailure = '[Samples] Failure exporting Excel file',
    ValidateSamples = '[Samples] Validate samples',
    ValidateSamplesSuccess = '[Samples] Successfully validated samples',
    ValidateSamplesFailure = '[Samples] Failure validating samples',
    SendSamplesInitiate = '[Samples] Initiating sending samples',
    SendSamplesFromStore = '[Samples] Send samples from store',
    SendSamplesConfirm = '[Samples] Confirm sending samples',
    SendSamplesSuccess = '[Samples] Successfully sent samples',
    SendSamplesFailure = '[Samples] Failure sending samples',
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

export class ImportExcelFileFailure implements Action {
    readonly type = SamplesActionTypes.ImportExcelFileFailure;

    constructor(public payload: IAlert) {

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

    constructor(public payload: IAlert) {
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

export class ValidateSamplesFailure implements Action {
    readonly type = SamplesActionTypes.ValidateSamplesFailure;

    constructor(public payload: IAlert) {

    }
}

export class SendSamplesInitiate implements Action {
    readonly type = SamplesActionTypes.SendSamplesInitiate;

    constructor(public payload: ISampleSheet) {

    }
}

export class SendSamplesFromStore implements Action {
    readonly type = SamplesActionTypes.SendSamplesFromStore;

    constructor(public payload: IUser) {
    }
}

export class SendSamplesSuccess implements Action {
    readonly type = SamplesActionTypes.SendSamplesSuccess;

    constructor(public payload: IAlert) {

    }
}

export class SendSamplesFailure implements Action {
    readonly type = SamplesActionTypes.SendSamplesFailure;

    constructor(public payload: IAlert) {

    }
}

export class SendSamplesConfirm implements Action {
    readonly type = SamplesActionTypes.SendSamplesConfirm;

    constructor(public payload: IModalContent) {
    }
}

export type SamplesActions = ImportExcelFile
    | ImportExcelFileSuccess
    | ImportExcelFileFailure
    | ValidateSamples
    | ValidateSamplesSuccess
    | ValidateSamplesFailure
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | SendSamplesFromStore
    | SendSamplesConfirm
    | SendSamplesSuccess
    | SendSamplesFailure
    | ChangeFieldValue
    | LogoutUser;
