import { Action } from '@ngrx/store';

export enum ExportSamplesActionTypes {
    ExportSamplesSSA = '[Samples/ExportSamples] Export samples as Excel file'
}

export class ExportSamplesSSA implements Action {
    readonly type = ExportSamplesActionTypes.ExportSamplesSSA;
}

export type ExportSamplesAction = ExportSamplesSSA;
