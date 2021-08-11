import { Action } from '@ngrx/store';

export enum SendSamplesActionTypes {
    SendSamplesSSA = '[Samples/SendSamples] Send samples',
    SendSamplesCancelAnalysisSSA = '[Samples/SendSamples] Cancel analysis dialog',
    SendSamplesConfirmAnalysisSSA = '[Samples/SendSamples] Confirm analysis dialog',
    SendSamplesCancelSendSSA = '[Samples/SendSamples] Cancel send dialog',
    SendSamplesConfirmSendSSA = '[Samples/SendSamples] Confirm send dialog',
    SendSamplesAddSentFileSOA = '[Samples/SendSamples] Add name of sent file to sent files'
}

export class SendSamplesSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesSSA;
}

// Analysis dialog

export class SendSamplesCancelAnalysisSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesCancelAnalysisSSA;
}

export class SendSamplesConfirmAnalysisSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesConfirmAnalysisSSA;
}

// Send dialog

export class SendSamplesCancelSendSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesCancelSendSSA;
}

export class SendSamplesConfirmSendSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesConfirmSendSSA;

    constructor(public payload: {comment: string}) {}
}

// Store

export class SendSamplesAddSentFileSOA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesAddSentFileSOA;

    constructor(public payload: {sentFile: string}) {}
}

export type SendSamplesAction =
    SendSamplesSSA
    | SendSamplesCancelAnalysisSSA
    | SendSamplesConfirmAnalysisSSA
    | SendSamplesCancelSendSSA
    | SendSamplesConfirmSendSSA
    | SendSamplesAddSentFileSOA;
