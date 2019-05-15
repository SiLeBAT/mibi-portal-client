import { Action } from '@ngrx/store';
import { ChangedDataGridField, Einsendebogen, SampleSet, SampleData } from '../model/sample-management.model';

export enum SamplesMainActionTypes {
    ClearSamples = '[Samples] Clear Samples',
    ImportExcelFile = '[Samples] Import Excel file',
    ImportExcelFileSuccess = '[Samples] Successfully imported Excel file',
    ExportExcelFile = '[Samples] Export Excel file',
    ExportExcelFileSuccess = '[Samples] Successfully exported Excel file',
    ExportExcelFileFailure = '[Samples] Failure exporting Excel file',
    ChangeFieldValue = '[Samples] Change field value'
}

// ClearSamples

export class ClearSamples implements Action {
    readonly type = SamplesMainActionTypes.ClearSamples;
}

export class ImportExcelFile implements Action {
    readonly type = SamplesMainActionTypes.ImportExcelFile;

    constructor(public payload: Einsendebogen) {

    }
}

export class ImportExcelFileSuccess implements Action {
    readonly type = SamplesMainActionTypes.ImportExcelFileSuccess;

    constructor(public payload: SampleSet) {

    }
}

// ExportExcelFile

export class ExportExcelFile implements Action {
    readonly type = SamplesMainActionTypes.ExportExcelFile;
}

export class ExportExcelFileSuccess implements Action {
    readonly type = SamplesMainActionTypes.ExportExcelFileSuccess;
}

export class ExportExcelFileFailure implements Action {
    readonly type = SamplesMainActionTypes.ExportExcelFileFailure;

    constructor(public payload: SampleData[]) {
    }
}
export class ChangeFieldValue implements Action {
    readonly type = SamplesMainActionTypes.ChangeFieldValue;

    constructor(public payload: ChangedDataGridField) { }
}

export type SamplesMainAction =
    ClearSamples
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | ChangeFieldValue;
