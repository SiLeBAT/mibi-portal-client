import { Action } from '@ngrx/store';

export enum DownloadSamplesActionTypes {
    DownloadSamplesSSA = '[Samples/DownloadSamples] Download samples',
    DownloadSamplesExportSSA = '[Samples/DownloadSamples] Export Excel file'
}

export class DownloadSamplesSSA implements Action {
    readonly type = DownloadSamplesActionTypes.DownloadSamplesSSA;
}

export class DownloadSamplesExportSSA implements Action {
    readonly type = DownloadSamplesActionTypes.DownloadSamplesExportSSA;
}

export type DownloadSamplesAction = DownloadSamplesSSA | DownloadSamplesExportSSA;
