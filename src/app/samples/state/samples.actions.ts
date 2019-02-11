import { Action } from '@ngrx/store';
import { AnnotatedSampleData, ExcelData, ChangedDataGridField } from '../model/sample-management.model';
import { Alert } from '../../core/model/alert.model';
import { LogoutUser } from '../../user/state/user.actions';
import { User } from '../../user/model/user.model';

export enum SamplesActionTypes {
    ClearSamples = '[Samples] Clear Samples',
    ImportExcelFile = '[Samples] Import Excel file',
    ImportExcelFileSuccess = '[Samples] Successfully imported Excel file',
    ExportExcelFile = '[Samples] Export Excel file',
    ExportExcelFileSuccess = '[Samples] Successfully exported Excel file',
    ExportExcelFileFailure = '[Samples] Failure exporting Excel file',
    ValidateSamples = '[Samples] Validate samples',
    ValidateSamplesSuccess = '[Samples] Successfully validated samples',
    SendSamplesInitiate = '[Samples] Initiating sending samples',
    SendSamplesConfirmed = '[Samples UI] User confirmed sending the samples',
    SendSamplesFromStore = '[Samples] Send samples from store',
    ChangeFieldValue = '[Samples] Change field value'
}

export class ChangeFieldValue implements Action {
    readonly type = SamplesActionTypes.ChangeFieldValue;

    constructor(public payload: ChangedDataGridField) {

    }
}

export class ImportExcelFile implements Action {
    readonly type = SamplesActionTypes.ImportExcelFile;

    constructor(public payload: File) {

    }
}

export class ClearSamples implements Action {
    readonly type = SamplesActionTypes.ClearSamples;

    constructor() {

    }
}

export class ImportExcelFileSuccess implements Action {
    readonly type = SamplesActionTypes.ImportExcelFileSuccess;

    constructor(public payload: ExcelData) {

    }
}

export class ExportExcelFile implements Action {
    readonly type = SamplesActionTypes.ExportExcelFile;

    constructor() {
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

    constructor() {

    }
}

export class ValidateSamplesSuccess implements Action {
    readonly type = SamplesActionTypes.ValidateSamplesSuccess;

    constructor(public payload: AnnotatedSampleData[]) {

    }
}

export class SendSamplesInitiate implements Action {
    readonly type = SamplesActionTypes.SendSamplesInitiate;

    constructor() {

    }
}

export class SendSamplesConfirmed implements Action {
    readonly type = SamplesActionTypes.SendSamplesConfirmed;

    constructor(public comment: string) {

    }
}

export class SendSamplesFromStore implements Action {
    readonly type = SamplesActionTypes.SendSamplesFromStore;

    constructor(public user: User, public comment: string) {
    }
}

export type SamplesActions = ImportExcelFile
    | ClearSamples
    | ImportExcelFileSuccess
    | ValidateSamples
    | ValidateSamplesSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | SendSamplesInitiate
    | SendSamplesConfirmed
    | SendSamplesFromStore
    | ChangeFieldValue
    | LogoutUser;
