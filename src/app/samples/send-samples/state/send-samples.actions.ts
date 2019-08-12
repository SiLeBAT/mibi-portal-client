import { Action } from '@ngrx/store';
import { CommandAction, ResponseAction } from '../../../shared/command/command.actions';
import { SendSamplesWarnings } from '../send-samples.model';

export enum SendSamplesActionTypes {
    SendSamples = '[Samples/SendSamples] Send samples',
    SendSamplesSuccess = '[Samples/SendSamples] Successfully sent samples',
    SendSamplesFailure = '[Samples/SendSamples] Sending samples failed',
    SendSamplesCancel = '[Samples/SendSamples] Sending samples cancelled',
    StoreSampleWarnings = '[Samples/SendSamples] Warnings generated'
}

// SendSamples

export class SendSamples implements CommandAction {
    readonly type = SendSamplesActionTypes.SendSamples;

    constructor(public source: string) { }
}

export class SendSamplesSuccess implements ResponseAction {
    readonly type = SendSamplesActionTypes.SendSamplesSuccess;
    readonly command = SendSamplesActionTypes.SendSamples;

    constructor(public payload: {sentFile: string}) {}
}

export class SendSamplesFailure implements ResponseAction {
    readonly type = SendSamplesActionTypes.SendSamplesFailure;
    readonly command = SendSamplesActionTypes.SendSamples;
}

export class SendSamplesCancel implements ResponseAction {
    readonly type = SendSamplesActionTypes.SendSamplesCancel;
    readonly command = SendSamplesActionTypes.SendSamples;
}

export class StoreSampleWarnings implements Action {
    readonly type = SendSamplesActionTypes.StoreSampleWarnings;

    constructor(public payload: {warnings: SendSamplesWarnings}) {}
}

export type SendSamplesAction =
    | SendSamples
    | SendSamplesSuccess
    | SendSamplesFailure
    | SendSamplesCancel
    | StoreSampleWarnings;
