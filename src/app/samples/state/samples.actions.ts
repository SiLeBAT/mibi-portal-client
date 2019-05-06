import { Action } from '@ngrx/store';
import { ExcelData, ChangedDataGridField } from '../model/sample-management.model';
import { Alert } from '../../core/model/alert.model';

export enum SamplesMainActionTypes {
    ClearSamples = '[Samples] Clear Samples',
    ImportExcelFile = '[Samples] Import Excel file',
    ImportExcelFileSuccess = '[Samples] Successfully imported Excel file',
    ImportExcelFileFailure = '[NEW Samples] Importing Excel file failed',
    ExportExcelFile = '[Samples] Export Excel file',
    ExportExcelFileSuccess = '[Samples] Successfully exported Excel file',
    ExportExcelFileFailure = '[Samples] Failure exporting Excel file',
    ChangeFieldValue = '[Samples] Change field value'
}

// ClearSamples

export class ClearSamples implements Action {
    readonly type = SamplesMainActionTypes.ClearSamples;
}

// ImportExcelFile

export class ImportExcelFile implements Action {
    readonly type = SamplesMainActionTypes.ImportExcelFile;

    constructor(public payload: File) { }
}

export class ImportExcelFileSuccess implements Action {
    readonly type = SamplesMainActionTypes.ImportExcelFileSuccess;

    constructor(public payload: ExcelData) { }
}

export class ImportExcelFileFailure implements Action {
    readonly type = SamplesMainActionTypes.ImportExcelFileFailure;

    constructor(public payload: ExcelData) { }
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

    constructor(public payload: Alert) { }
}

// ChangeFieldValue

export class ChangeFieldValue implements Action {
    readonly type = SamplesMainActionTypes.ChangeFieldValue;

    constructor(public payload: ChangedDataGridField) { }
}

export type SamplesMainAction =
ClearSamples
    | ImportExcelFile
    | ImportExcelFileSuccess
    | ImportExcelFileFailure
    | ExportExcelFile
    | ExportExcelFileSuccess
    | ExportExcelFileFailure
    | ChangeFieldValue;
