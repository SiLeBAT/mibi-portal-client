import { Action } from '@ngrx/store';
import { SendSamplesWarnings } from '../send-samples.model';

export enum SendSamplesActionTypes {
    SendSamplesSSA = '[Samples/SendSamples] Send samples',
    AddSentFileSOA = '[Samples/SendSamples] Add name of successfully sent file to list of sent files',
    UpdateSampleWarningsSOA = '[Samples/SendSamples] Set warnings for samples to be sent'
}

// SendSamples

export class SendSamplesSSA implements Action {
    readonly type = SendSamplesActionTypes.SendSamplesSSA;
}

export class AddSentFileSOA implements Action {
    readonly type = SendSamplesActionTypes.AddSentFileSOA;

    constructor(public payload: {sentFile: string}) {}
}

export class UpdateSampleWarningsSOA implements Action {
    readonly type = SendSamplesActionTypes.UpdateSampleWarningsSOA;

    constructor(public payload: {warnings: SendSamplesWarnings}) {}
}

export type SendSamplesAction =
    | SendSamplesSSA
    | AddSentFileSOA
    | UpdateSampleWarningsSOA;
