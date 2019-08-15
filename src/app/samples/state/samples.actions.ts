import { Action } from '@ngrx/store';
import { ChangedDataGridField, SampleSet, ExcelFile, SampleData } from '../model/sample-management.model';

export enum SamplesMainActionTypes {
    UpdateSampleSetSOA = '[Samples] Set sample set',
    DestroySampleSetSOA = '[Samples] Clear store of all samples related data',
    UpdateSampleDataSOA = '[Samples] Set sample data',
    UpdateSampleDataEntrySOA = '[Samples] Change single sample data field value',
    ShowSamplesSSA = '[Samples] Navigate to samples view and validate samples',
    ImportExcelFileMSA = '[Samples] Import Excel file',
    ExportExcelFileSSA = '[Samples] Export Excel file'
}

// Samples

export class UpdateSampleSetSOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSampleSetSOA;

    constructor(public payload: SampleSet) { }
}

export class DestroySampleSetSOA implements Action {
    readonly type = SamplesMainActionTypes.DestroySampleSetSOA;
}

export class UpdateSampleDataSOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSampleDataSOA;

    constructor(public payload: SampleData[]) { }
}

export class UpdateSampleDataEntrySOA implements Action {
    readonly type = SamplesMainActionTypes.UpdateSampleDataEntrySOA;

    constructor(public payload: ChangedDataGridField) { }
}

export class ShowSamplesSSA implements Action {
    readonly type = SamplesMainActionTypes.ShowSamplesSSA;
}

// Excel file

export class ImportExcelFileMSA implements Action {
    readonly type = SamplesMainActionTypes.ImportExcelFileMSA;

    constructor(public payload: ExcelFile) { }
}

export class ExportExcelFileSSA implements Action {
    readonly type = SamplesMainActionTypes.ExportExcelFileSSA;
}

export type SamplesMainAction =
    UpdateSampleSetSOA
    | DestroySampleSetSOA
    | UpdateSampleDataSOA
    | UpdateSampleDataEntrySOA
    | ShowSamplesSSA
    | ImportExcelFileMSA
    | ExportExcelFileSSA;
