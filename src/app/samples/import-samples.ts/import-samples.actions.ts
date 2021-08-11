import { Action } from '@ngrx/store';
import { ExcelFile } from '../model/sample-management.model';

export enum ImportSamplesActionTypes {
    ImportSamplesMSA = '[Samples/ImportSamples] Import samples from Excel file'
}

export class ImportSamplesMSA implements Action {
    readonly type = ImportSamplesActionTypes.ImportSamplesMSA;

    constructor(public payload: { excelFile: ExcelFile }) { }
}

export type ImportSamplesAction = ImportSamplesMSA;
