import { Action } from '@ngrx/store';

export enum SendSamplesActionTypes {
    SendSamplesSSA = '[Samples/SendSamples] Send samples',
    SendSamplesValidateSSA = '[Samples/SendSamples] Validate samples',
    SendSamplesOpenAnalysisSSA = '[Samples/SendSamples] Open analysis dialog',
    SendSamplesCancelAnalysisSSA = '[Samples/SendSamples] Cancel analysis dialog',
    SendSamplesConfirmAnalysisSSA = '[Samples/SendSamples] Confirm analysis dialog',
    SendSamplesCancelSendSSA = '[Samples/SendSamples] Cancel send dialog',
    SendSamplesConfirmSendSSA = '[Samples/SendSamples] Confirm send dialog',
    SendSamplesSendSSA = '[Samples/SendSamples] Send samples to server',
    SendSamplesAddSentFileSOA = '[Samples/SendSamples] Add name of sent file to sent files'
}

export class SendSamplesSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesSSA;
}

// Validate samples

export class SendSamplesValidateSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesValidateSSA;
}

// Analysis dialog

export class SendSamplesOpenAnalysisSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesOpenAnalysisSSA;
}

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

// Send samples

export class SendSamplesSendSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesSendSSA;

    constructor(public payload: {comment: string}) {}
}

// Store

export class SendSamplesAddSentFileSOA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesAddSentFileSOA;

    constructor(public payload: {sentFile: string}) {}
}

export type SendSamplesAction =
    SendSamplesSSA
    | SendSamplesValidateSSA
    | SendSamplesOpenAnalysisSSA
    | SendSamplesCancelAnalysisSSA
    | SendSamplesConfirmAnalysisSSA
    | SendSamplesCancelSendSSA
    | SendSamplesConfirmSendSSA
    | SendSamplesSendSSA
    | SendSamplesAddSentFileSOA;
