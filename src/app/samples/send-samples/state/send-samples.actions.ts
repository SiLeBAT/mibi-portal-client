import { Action } from '@ngrx/store';

export enum SendSamplesActionTypes {
    OpenSendDialogSSA = '[Samples/SendSamples] Open send dialog',
    SendSamplesSSA = '[Samples/SendSamples] Send samples to server',
    AddSentFilesSOA = '[Samples/SendSamples] Add name of sent file to list of sent files'
}

// SendSamples

export class SendSamplesOpenSendDialogSSA implements Action {
    readonly type = SendSamplesActionTypes.OpenSendDialogSSA;
}

export class SendSamplesSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesSSA;

    constructor(public payload: {comment: string}) {}
}

export class SendSamplesAddSentFileSOA implements Action {
    readonly type = SendSamplesActionTypes.AddSentFilesSOA;

    constructor(public payload: {sentFile: string}) {}
}

export type SendSamplesAction =
    SendSamplesOpenSendDialogSSA
    | SendSamplesSSA
    | SendSamplesAddSentFileSOA;
