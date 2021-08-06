import { Action } from '@ngrx/store';
import { ExcelFile } from '../model/sample-management.model';

export enum UploadSamplesActionTypes {
    UploadSamplesMSA = '[Samples/UploadSamples] Upload samples',
    UploadSamplesImportSSA = '[Samples/UploadSamples] Import Excel file',
    UploadSamplesValidateSSA = '[Samples/UploadSamples] Validate samples',
    UploadSamplesShowSSA = 'Samples/UploadSamples] Navigate to samples view'
}

export class UploadSamplesMSA implements Action {
    readonly type = UploadSamplesActionTypes.UploadSamplesMSA;

    constructor(public payload: { excelFile: ExcelFile }) { }
}

export class UploadSamplesImportSSA implements Action {
    readonly type = UploadSamplesActionTypes.UploadSamplesImportSSA;

    constructor(public payload: { excelFile: ExcelFile }) { }
}

export class UploadSamplesValidateSSA implements Action {
    readonly type = UploadSamplesActionTypes.UploadSamplesValidateSSA;
}

export class UploadSamplesShowSSA implements Action {
    readonly type = UploadSamplesActionTypes.UploadSamplesShowSSA;
}

export type UploadSamplesAction =
    UploadSamplesMSA
    | UploadSamplesImportSSA
    | UploadSamplesValidateSSA
    | UploadSamplesShowSSA;
